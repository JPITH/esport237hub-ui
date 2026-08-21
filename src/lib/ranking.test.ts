/**
 * Le classement saisonnier annonce une échéance : « il reste 12 jours ». Une
 * échéance fausse fait jouer un joueur pour rien — ces trois calculs se
 * vérifient, en particulier la saison SANS date de fin, qui ne doit produire
 * ni barre ni compte à rebours.
 */
import { describe, expect, it } from 'bun:test';

import {
  MAX_COUNTED_DUELS,
  ROLLOVER_OUTCOME_LABEL,
  ROLLOVER_OUTCOME_TONE,
  seasonResultLabel,
  countedDuels,
  divisionDisplayRank,
  duelsUntilRankedLabel,
  isRankedForSeason,
  seasonProgress,
  seasonRemainingLabel,
} from './ranking';

const DAY = 86_400_000;
const START = Date.parse('2026-07-01T00:00:00Z');
const END = Date.parse('2026-12-31T00:00:00Z');

describe('seasonProgress', () => {
  it('va de 0 à 1 entre les deux bornes', () => {
    expect(seasonProgress(START, END, START)).toBe(0);
    expect(seasonProgress(START, END, END)).toBe(1);
    expect(seasonProgress(START, END, (START + END) / 2)).toBe(0.5);
  });

  it('borne au lieu de déborder', () => {
    expect(seasonProgress(START, END, START - DAY)).toBe(0);
    expect(seasonProgress(START, END, END + 30 * DAY)).toBe(1);
  });

  it('ne renvoie rien quand la saison n’a pas de fin', () => {
    expect(seasonProgress(START, null)).toBeNull();
    expect(seasonProgress(START, undefined)).toBeNull();
  });

  it('refuse une fenêtre incohérente plutôt que d’inventer un ratio', () => {
    expect(seasonProgress(END, START)).toBeNull();
    expect(seasonProgress('pas une date', END)).toBeNull();
  });
});

describe('seasonRemainingLabel', () => {
  it('compte les jours restants, arrondis vers le haut', () => {
    expect(seasonRemainingLabel(END, END - 12 * DAY)).toBe('Il reste 12 jours');
    expect(seasonRemainingLabel(END, END - 11.2 * DAY)).toBe('Il reste 12 jours');
  });

  it('nomme le dernier jour au lieu d’écrire « 1 jours »', () => {
    expect(seasonRemainingLabel(END, END - DAY / 2)).toBe('Dernier jour');
  });

  it('dit la fin, sans nombre négatif', () => {
    expect(seasonRemainingLabel(END, END)).toBe('Saison terminée');
    expect(seasonRemainingLabel(END, END + 5 * DAY)).toBe('Saison terminée');
  });

  it('reste muet sans date de fin', () => {
    expect(seasonRemainingLabel(null)).toBeNull();
  });
});

describe('divisionDisplayRank', () => {
  it('préfère le palier calculé par l’API', () => {
    expect(divisionDisplayRank({ rank: 4, tier: 1, name: 'Élite' })).toBe(1);
  });

  it('retombe sur le grade quand le palier manque', () => {
    // Affichage à l'envers, et c'est voulu : un défaut qui se voit vaut mieux
    // qu'un palier inventé côté client à partir d'une liste incomplète.
    expect(divisionDisplayRank({ rank: 4, name: 'Élite' })).toBe(4);
  });
});

describe('plancher et plafond de duels (§6)', () => {
  it('classe à partir du cinquième duel, pas avant', () => {
    expect(isRankedForSeason(4)).toBe(false);
    expect(isRankedForSeason(5)).toBe(true);
  });

  it('dit ce qu’il reste à jouer, au singulier comme au pluriel', () => {
    expect(duelsUntilRankedLabel(0)).toBe('Encore 5 duels pour être classé cette saison');
    expect(duelsUntilRankedLabel(4)).toBe('Encore 1 duel pour être classé cette saison');
  });

  it('se tait quand c’est acquis — jamais « 0 duel restant »', () => {
    expect(duelsUntilRankedLabel(5)).toBeNull();
    expect(duelsUntilRankedLabel(30)).toBeNull();
  });

  it('plafonne les duels comptabilisés sans effacer ceux joués', () => {
    expect(countedDuels(12)).toBe(12);
    expect(countedDuels(25)).toBe(MAX_COUNTED_DUELS);
    expect(countedDuels(-3)).toBe(0);
  });
});

describe('bornes réglées en back-office', () => {
  // Le porteur peut déplacer plancher et plafond sans déploiement : l'écran
  // doit suivre le réglage, pas la constante du document.
  it('suit le plancher fourni', () => {
    expect(isRankedForSeason(3, 3)).toBe(true);
    expect(duelsUntilRankedLabel(1, 3)).toBe('Encore 2 duels pour être classé cette saison');
    expect(duelsUntilRankedLabel(3, 3)).toBeNull();
  });

  it('suit le plafond fourni', () => {
    expect(countedDuels(25, 10)).toBe(10);
  });
});

describe('seasonResultLabel — trois cas, deux fois la même donnée', () => {
  it('ne dit PAS « non classé » sur une saison en cours', () => {
    // `finalPosition` est nul dans les deux cas : seule la saison clôturée
    // veut dire « il n'a pas atteint le plancher ». L'autre veut dire « elle
    // n'est pas finie », et écrire « non classé » dessus serait faux et
    // décourageant.
    expect(seasonResultLabel('live', null)).toBe('Saison en cours');
    expect(seasonResultLabel('upcoming', null)).toBe('Saison en cours');
    expect(seasonResultLabel('closed', null)).toBe('Non classé');
  });

  it('écrit le rang final, et « 1ᵉʳ » plutôt que « 1ᵉ »', () => {
    expect(seasonResultLabel('closed', 1)).toBe('1ᵉʳ');
    expect(seasonResultLabel('closed', 4)).toBe('4ᵉ');
    expect(seasonResultLabel('ended', 12)).toBe('12ᵉ');
  });
});

describe('vocabulaire de la clôture', () => {
  it('nomme le sort du point de vue du joueur', () => {
    expect(ROLLOVER_OUTCOME_LABEL.promoted).toBe('Promu');
    expect(ROLLOVER_OUTCOME_LABEL.relegated).toBe('Relégué');
    expect(ROLLOVER_OUTCOME_LABEL.stayed).toBe('Maintenu');
  });

  it('garde « maintenu » NEUTRE — ce n’est ni une victoire ni un échec', () => {
    expect(ROLLOVER_OUTCOME_TONE.stayed).toBe('neutral');
    expect(ROLLOVER_OUTCOME_TONE.promoted).toBe('success');
    expect(ROLLOVER_OUTCOME_TONE.relegated).toBe('danger');
  });
});
