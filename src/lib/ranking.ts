/**
 * Classement — libellés de mouvement et horloge du direct.
 *
 * Ces trois calculs étaient dupliqués entre `apps/web/.../classement/page.tsx`
 * et `apps/mobile/.../(tabs)/classement.tsx`, `formatClock` avec des sorties
 * DIVERGENTES (secondes côté web, pas côté natif) alors que c'est le même
 * bandeau « Mis à jour à … ». On garde les secondes : le classement en direct
 * bouge à la seconde, l'heure doit le montrer.
 */
import { dsLocale, dsT } from '../i18n';

/** Sens de mouvement d'une ligne (rang) ou d'un grade (division). */
export type RankMovement = 'up' | 'down' | 'same';

/** État du canal temps réel du classement. */
export type LiveStatus = 'live' | 'connecting' | 'offline';

/**
 * Getters plutôt que des valeurs figées : `LIVE_STATUS_LABEL[status]` reste
 * indexable comme avant (des écrans hors de ce paquet le lisent ainsi), mais
 * chaque lecture retraduit dans la langue courante.
 */
export const LIVE_STATUS_LABEL: Record<LiveStatus, string> = {
  get live() {
    return dsT('ranking.live_status.live');
  },
  get connecting() {
    return dsT('ranking.live_status.connecting');
  },
  get offline() {
    return dsT('ranking.live_status.offline');
  },
};

/**
 * Nombre de places gagnées ou perdues, ou `undefined` si la ligne n'a pas
 * bougé (ou n'a pas d'historique).
 */
export function rankMovementPlaces(
  movement: RankMovement,
  rank: number,
  previousRank: number | null | undefined,
): number | undefined {
  if (movement === 'same' || previousRank === null || previousRank === undefined) {
    return undefined;
  }
  return Math.abs(previousRank - rank);
}

/** « Monté de 3 places » / « Descendu de 1 place » / « Position stable ». */
export function rankMovementLabel(
  movement: RankMovement,
  places: number | undefined,
): string {
  if (places === undefined) return dsT('ranking.movement.stable');
  const suffix = places > 1 ? 'other' : 'one';
  return dsT(
    movement === 'up' ? `ranking.movement.up_${suffix}` : `ranking.movement.down_${suffix}`,
    { n: places },
  );
}

/** « Promu en Elite » / « Rétrogradé en Challenger » / division inchangée. */
export function divisionMovementLabel(
  movement: RankMovement,
  divisionName: string,
): string {
  if (movement === 'same') {
    return dsT('ranking.division_movement.same', { division: divisionName });
  }
  return dsT(
    movement === 'up' ? 'ranking.division_movement.up' : 'ranking.division_movement.down',
    { division: divisionName },
  );
}

/**
 * Heure locale « 14:32:05 » — l'horodatage n'existe qu'après montage.
 * Le tag de langue suit `dsLocale()` : un joueur en anglais ne doit pas lire
 * une horloge mise en forme à la française.
 */
export function formatClock(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat(dsLocale() === 'en' ? 'en-GB' : 'fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(timestamp));
  } catch {
    const d = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}

/* ------------------------------------------------------------------ */
/* Portées du classement — saisonnier / général                        */
/* ------------------------------------------------------------------ */

/**
 * Les deux classements du produit, et il ne faut surtout pas les confondre.
 *
 * Document « G-Hub — Ranking, Divisions, Duels et Saisons » §4 :
 *  * `season` — la Division répond à « quel est mon niveau compétitif pendant
 *    cette saison ? ». Remis à zéro chaque mois, c'est LUI qui porte les
 *    divisions : un grade n'a de sens que sur une période fermée.
 *  * `national` — le Ranking national répond à « quelle est ma position
 *    globale parmi tous les joueurs ? ». Jamais remis à zéro, et INDÉPENDANT
 *    de la division : §2 le dit noir sur blanc, « un joueur peut être en
 *    Division 3 et avoir un meilleur Ranking national qu'un joueur d'une
 *    division supérieure ». Ne jamais y afficher de pilule de division.
 */
export type RankingScope = 'season' | 'national';

export const RANKING_SCOPES: readonly RankingScope[] = ['season', 'national'];

/** Onglet. Court : il vit dans un sélecteur de deux boutons. */
export const RANKING_SCOPE_LABEL: Record<RankingScope, string> = {
  get season() {
    return dsT('ranking.scope_label.season');
  },
  get national() {
    return dsT('ranking.scope_label.national');
  },
};

/** Ce que l'onglet promet — affiché sous le sélecteur, une ligne. */
export const RANKING_SCOPE_HINT: Record<RankingScope, string> = {
  get season() {
    return dsT('ranking.scope_hint.season');
  },
  get national() {
    return dsT('ranking.scope_hint.national');
  },
};

/* ------------------------------------------------------------------ */
/* Le plancher et le plafond de duels d'une saison (§6)                */
/* ------------------------------------------------------------------ */

/**
 * ⚠️ Ces deux bornes sont RÉGLABLES en back-office (table `ranking_rules`) :
 * l'API les publie sur `GET /rankings/rules`. Les constantes ci-dessous ne
 * sont que les valeurs du document — le repli quand l'écran n'a pas encore
 * chargé le barème, jamais la vérité.
 *
 * Toutes les fonctions ci-dessous acceptent donc les bornes en paramètre. Un
 * écran qui afficherait « encore 5 duels » alors que le porteur a réglé le
 * plancher à 3 mentirait au joueur sur une échéance.
 */
export const MIN_DUELS_FOR_RANKING = 5;
export const MAX_COUNTED_DUELS = 20;

/** Le joueur sera-t-il classé si la saison se termine maintenant ? */
export function isRankedForSeason(
  duelsPlayed: number,
  minDuels: number = MIN_DUELS_FOR_RANKING,
): boolean {
  return duelsPlayed >= minDuels;
}

/**
 * Ce qu'il reste à faire pour être classé — la phrase que l'écran de saison
 * doit montrer. `null` quand c'est acquis : on ne félicite pas à chaque
 * affichage, et on n'écrit jamais « 0 duel restant ».
 *
 * Un joueur qui découvre en fin de mois qu'il n'était pas classé aura joué
 * pour rien ; c'est la seule information de cet écran qui a une échéance.
 */
export function duelsUntilRankedLabel(
  duelsPlayed: number,
  minDuels: number = MIN_DUELS_FOR_RANKING,
): string | null {
  const left = minDuels - duelsPlayed;
  if (left <= 0) return null;
  return dsT(
    left === 1 ? 'ranking.duels_until_ranked_one' : 'ranking.duels_until_ranked_other',
    { n: left },
  );
}

/**
 * Les duels de la saison qui rapportent encore. Au-delà du plafond, le joueur
 * continue de jouer — il ne marque plus.
 */
export function countedDuels(
  duelsPlayed: number,
  maxCounted: number = MAX_COUNTED_DUELS,
): number {
  return Math.min(Math.max(0, duelsPlayed), maxCounted);
}

/** Une division telle qu'elle s'affiche : le palier compte depuis le HAUT. */
export interface DivisionView {
  /** Grade en base — le plus GRAND est le plus haut. Ne pas afficher. */
  rank: number;
  /**
   * Palier affiché : 1 = la division la plus haute. C'est l'API qui le
   * calcule (elle seule connaît la liste complète des divisions d'un jeu) —
   * voir `divisionTier()` côté NestJS. En son absence on retombe sur `rank`,
   * mais l'affichage sera alors à l'envers : c'est un défaut visible, pas une
   * corruption silencieuse.
   *
   * `null` est une réponse LÉGITIME de l'API : elle rend `null` plutôt qu'un
   * palier plausible quand la division ne fait pas partie de l'échelle du jeu
   * (identifiant orphelin). Le type l'accepte donc explicitement — le forcer à
   * `undefined` obligerait chaque appelant à convertir, et l'un d'eux
   * finirait par convertir en `0`.
   */
  tier?: number | null;
  name: string;
  color?: string | null;
}

/** Le numéro à écrire dans la pilule « DIV n ». */
export function divisionDisplayRank(division: DivisionView): number {
  return division.tier ?? division.rank;
}

/**
 * Avancement d'une saison, de 0 à 1. Sert à la barre « il reste X jours » :
 * une saison sans date de fin renvoie `null`, et l'interface n'affiche alors
 * pas de barre plutôt qu'une barre vide qui laisserait croire à une fin
 * imminente.
 */
export function seasonProgress(
  startsAt: string | number | Date,
  endsAt: string | number | Date | null | undefined,
  now: number = Date.now(),
): number | null {
  if (endsAt === null || endsAt === undefined) return null;
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const ratio = (now - start) / (end - start);
  if (ratio <= 0) return 0;
  if (ratio >= 1) return 1;
  return Math.round(ratio * 100) / 100;
}

/**
 * « Il reste 12 jours » / « Dernier jour » / « Saison terminée ».
 * `null` quand la saison n'a pas de fin — on n'invente pas d'échéance.
 */
export function seasonRemainingLabel(
  endsAt: string | number | Date | null | undefined,
  now: number = Date.now(),
): string | null {
  if (endsAt === null || endsAt === undefined) return null;
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(end)) return null;
  const msLeft = end - now;
  if (msLeft <= 0) return dsT('ranking.season_remaining.ended');
  const days = Math.ceil(msLeft / 86_400_000);
  if (days <= 1) return dsT('ranking.season_remaining.last_day');
  return dsT('ranking.season_remaining.days', { days });
}

/* ------------------------------------------------------------------ */
/* Le palmarès d'une saison passée                                     */
/* ------------------------------------------------------------------ */

/** Ce qui est arrivé au joueur à la clôture (§8). */
export type RolloverOutcome = 'promoted' | 'relegated' | 'stayed';

/** Le mot, du point de vue du JOUEUR — pas du système. */
export const ROLLOVER_OUTCOME_LABEL: Record<RolloverOutcome, string> = {
  get promoted() {
    return dsT('ranking.rollover.promoted');
  },
  get relegated() {
    return dsT('ranking.rollover.relegated');
  },
  get stayed() {
    return dsT('ranking.rollover.stayed');
  },
};

/**
 * La tonalité du sort — vocabulaire partagé avec `lib/tone`.
 *
 * `stayed` est NEUTRE et non « succès » : se maintenir n'est ni une victoire
 * ni un échec, et le peindre en vert récompenserait l'immobilité autant que la
 * promotion.
 */
export const ROLLOVER_OUTCOME_TONE: Record<RolloverOutcome, 'success' | 'danger' | 'neutral'> = {
  promoted: 'success',
  relegated: 'danger',
  stayed: 'neutral',
};

/**
 * Le résultat d'une saison, en une phrase.
 *
 * ⚠️ Trois cas, et deux d'entre eux ont la même donnée (`finalPosition` nul) :
 *  * saison EN COURS — elle n'a pas encore de palmarès ;
 *  * saison CLÔTURÉE sans position — le joueur n'était pas classé, il n'a pas
 *    atteint le plancher de duels de l'époque ;
 *  * saison clôturée avec position — son rang final.
 *
 * Les confondre écrirait « non classé » sur la saison qu'un joueur est en
 * train de jouer, ce qui est faux et décourageant.
 */
export function seasonResultLabel(
  state: string,
  finalPosition: number | null | undefined,
): string {
  if (state === 'live' || state === 'upcoming') {
    return dsT('ranking.season_result.in_progress');
  }
  if (finalPosition === null || finalPosition === undefined) {
    return dsT('ranking.season_result.unranked');
  }
  return ordinalLabel(finalPosition);
}

/**
 * L'ordinal d'un rang final, une règle par langue :
 *  * français — « 1ᵉʳ » pour 1, « ᵉ » pour tout le reste (2ᵉ, 11ᵉ, 21ᵉ…),
 *    sans exception ;
 *  * anglais — 1st/2nd/3rd/nth, avec l'exception classique des nombres
 *    finissant par 11, 12 ou 13 (11th, 12th, 13th, pas 11st/12nd/13rd).
 * Deux règles simples valent mieux qu'un algorithme unique qui devine la
 * langue depuis le nombre — ça n'existe pas, et ça finirait fragile.
 */
function ordinalLabel(position: number): string {
  if (dsLocale() !== 'en') {
    return position === 1 ? `${position}ᵉʳ` : `${position}ᵉ`;
  }
  const mod100 = position % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${position}th`;
  switch (position % 10) {
    case 1:
      return `${position}st`;
    case 2:
      return `${position}nd`;
    case 3:
      return `${position}rd`;
    default:
      return `${position}th`;
  }
}
