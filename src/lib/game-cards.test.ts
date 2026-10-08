import { describe, expect, it } from 'bun:test';

import {
  cardRecord,
  mainGameCard,
  odometerDigits,
  odometerOffset,
  orderedGameCards,
} from './game-cards';

function card(slug: string, points: number, wins = 0, losses = 0, rating = 60) {
  return { id: slug, points, wins, losses, rating, game: { slug, name: slug.toUpperCase() } };
}

describe('mainGameCard', () => {
  it('ne fabrique pas de carte quand il n’y en a pas', () => {
    expect(mainGameCard([])).toBeNull();
    expect(mainGameCard(null)).toBeNull();
    expect(mainGameCard(undefined)).toBeNull();
  });

  it('retient la discipline la plus riche en points', () => {
    expect(mainGameCard([card('fc27', 120), card('clash-royale', 300)])?.id).toBe('clash-royale');
  });

  it('départage les points par les duels joués, puis par la note', () => {
    expect(mainGameCard([card('a', 100, 1, 1), card('b', 100, 4, 3)])?.id).toBe('b');
    expect(mainGameCard([card('a', 100, 2, 2, 70), card('b', 100, 2, 2, 81)])?.id).toBe('b');
  });

  it('ne dépend pas de l’ordre de la réponse à égalité parfaite', () => {
    const one = mainGameCard([card('fc27', 0), card('clash-royale', 0)]);
    const two = mainGameCard([card('clash-royale', 0), card('fc27', 0)]);
    expect(one?.id).toBe(two?.id);
    expect(one?.id).toBe('clash-royale');
  });

  it('accepte une carte sans bilan ni jeu (réponse partielle)', () => {
    expect(mainGameCard([{ points: 5 }, { points: 9 }])?.points).toBe(9);
  });
});

describe('orderedGameCards', () => {
  it('met le jeu principal en premier et garde toutes les cartes', () => {
    const list = orderedGameCards([card('a', 10), card('b', 50), card('c', 30)]);
    expect(list.map((c) => c.id)).toEqual(['b', 'c', 'a']);
    expect(orderedGameCards(null)).toEqual([]);
  });
});

describe('cardRecord', () => {
  it('compte les duels joués et le taux de victoire arrondi', () => {
    expect(cardRecord(7, 3)).toEqual({ played: 10, wins: 7, losses: 3, winRate: 70 });
    expect(cardRecord(2, 1).winRate).toBe(67);
  });

  it('affiche « — » plutôt que 0 % sans duel', () => {
    expect(cardRecord(0, 0).winRate).toBeNull();
  });

  it('n’invente pas de taux quand les défaites sont inconnues', () => {
    expect(cardRecord(5)).toEqual({ played: 5, wins: 5, losses: 0, winRate: null });
  });
});

describe('odometerOffset', () => {
  it('pose chaque colonne sur son chiffre au repos', () => {
    expect(odometerOffset(74, 0)).toBe(4);
    expect(odometerOffset(74, 1)).toBe(7);
    expect(odometerOffset(103, 2)).toBe(1);
  });

  it('ne fait tourner les dizaines que pendant la dernière unité', () => {
    expect(odometerOffset(68.5, 1)).toBe(6);
    expect(odometerOffset(69.5, 1)).toBeCloseTo(6.5, 5);
    expect(odometerOffset(70, 1)).toBe(7);
    expect(odometerOffset(69.5, 0)).toBeCloseTo(9.5, 5);
  });

  it('reste borné à [0, 10]', () => {
    for (let v = 0; v <= 120; v += 0.25) {
      for (const place of [0, 1, 2]) {
        const o = odometerOffset(v, place);
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe('odometerDigits', () => {
  it('prévoit assez de colonnes pour les deux bornes', () => {
    expect(odometerDigits(71, 74)).toBe(2);
    expect(odometerDigits(98, 101)).toBe(3);
    expect(odometerDigits(0, 0)).toBe(1);
  });
});
