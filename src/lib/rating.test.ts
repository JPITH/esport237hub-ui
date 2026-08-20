/**
 * Les avis décident d'un CLASSEMENT public de salles : ce qui s'affiche doit
 * être vérifié, en particulier les deux pièges qui abîment une réputation —
 * une salle sans avis affichée « 0 », et deux surfaces qui n'arrondissent pas
 * la même moyenne de la même façon.
 */
import { describe, expect, it } from 'bun:test';

import {
  RATING_LABELS,
  clampScore,
  formatRatingAverage,
  ratingCountLabel,
  ratingDistribution,
  ratingLabel,
  starFills,
} from './rating';

describe('formatRatingAverage', () => {
  it('écrit une décimale, à la française', () => {
    expect(formatRatingAverage(4.25)).toBe('4,3');
    expect(formatRatingAverage(5)).toBe('5,0');
  });

  it('ne rend JAMAIS « 0 » pour une salle sans avis', () => {
    expect(formatRatingAverage(null)).toBe('—');
    expect(formatRatingAverage(undefined)).toBe('—');
    expect(formatRatingAverage(Number.NaN)).toBe('—');
  });

  it('rend bien 0,0 quand la note vaut vraiment zéro', () => {
    // Impossible par la règle (1..5), mais un jour une donnée fautive passera :
    // mieux vaut afficher le zéro que le confondre avec « pas encore noté ».
    expect(formatRatingAverage(0)).toBe('0,0');
  });
});

describe('clampScore / ratingLabel', () => {
  it('arrondit à l’entier le plus proche', () => {
    expect(clampScore(4.4)).toBe(4);
    expect(clampScore(4.5)).toBe(5);
  });

  it('reste dans les bornes', () => {
    expect(clampScore(-3)).toBe(1);
    expect(clampScore(42)).toBe(5);
    expect(clampScore(Number.NaN)).toBe(1);
  });

  it('donne le même mot des deux côtés de la même moyenne', () => {
    expect(ratingLabel(3.6)).toBe(RATING_LABELS[4]);
    expect(ratingLabel(4)).toBe(RATING_LABELS[4]);
    expect(ratingLabel(4.2)).toBe(RATING_LABELS[4]);
  });
});

describe('ratingCountLabel', () => {
  it('nomme l’absence d’avis au lieu d’écrire 0', () => {
    expect(ratingCountLabel(0)).toBe('Aucun avis');
    expect(ratingCountLabel(null)).toBe('Aucun avis');
  });

  it('compte au singulier comme au pluriel — « avis » est invariable', () => {
    expect(ratingCountLabel(1)).toBe('1 avis');
    expect(ratingCountLabel(12)).toBe('12 avis');
  });
});

describe('starFills', () => {
  it('remplit la dernière étoile à la fraction', () => {
    expect(starFills(4.3)).toEqual([1, 1, 1, 1, 0.3]);
  });

  it('arrondit au centième — le flottant ne traverse pas jusqu’au CSS', () => {
    expect(starFills(3.333)).toEqual([1, 1, 1, 0.33, 0]);
  });

  it('ne déborde jamais des bornes', () => {
    expect(starFills(0)).toEqual([0, 0, 0, 0, 0]);
    expect(starFills(9)).toEqual([1, 1, 1, 1, 1]);
    expect(starFills(null)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe('ratingDistribution', () => {
  it('descend de 5 à 1 et rapporte au TOTAL', () => {
    const bars = ratingDistribution({ 5: 6, 4: 2, 3: 2 });
    expect(bars.map((b) => b.score)).toEqual([5, 4, 3, 2, 1]);
    expect(bars.map((b) => b.percent)).toEqual([60, 20, 20, 0, 0]);
  });

  it('ne divise pas par zéro', () => {
    const bars = ratingDistribution({});
    expect(bars.every((b) => b.percent === 0 && b.count === 0)).toBe(true);
    expect(ratingDistribution(null)).toHaveLength(5);
  });

  it('ignore les comptes négatifs plutôt que de fausser le total', () => {
    const bars = ratingDistribution({ 5: 3, 1: -5 });
    expect(bars[0]?.percent).toBe(100);
    expect(bars[4]?.count).toBe(0);
  });
});
