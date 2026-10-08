import { describe, expect, it } from 'bun:test';

import { confettiAt, confettiPieces, shouldBurst } from './confetti-model';

describe('confettis — une gerbe légère et reproductible', () => {
  const pieces = confettiPieces(32, 4);

  it('même graine, même gerbe', () => {
    expect(confettiPieces(32, 4)).toEqual(pieces);
    expect(confettiPieces(32, 4, 1)).not.toEqual(pieces);
  });

  it('part vers le haut, en éventail, avec toutes les couleurs', () => {
    expect(pieces.every((p) => p.vy < 0)).toBe(true);
    expect(pieces.some((p) => p.vx < 0)).toBe(true);
    expect(pieces.some((p) => p.vx > 0)).toBe(true);
    expect(new Set(pieces.map((p) => p.colorIndex)).size).toBe(4);
  });

  it('tolère une palette vide sans diviser par zéro', () => {
    expect(confettiPieces(3, 0).every((p) => p.colorIndex === 0)).toBe(true);
  });

  it('retombe et s’efface : invisible au départ et à la fin', () => {
    const p = pieces[0]!;
    expect(confettiAt(p, 0).opacity).toBe(0);
    expect(confettiAt(p, 0.5).opacity).toBe(1);
    expect(confettiAt(p, 1).opacity).toBe(0);
    // La gravité finit par l'emporter : l'éclat redescend sous son point de départ.
    expect(confettiAt({ ...p, delay: 0 }, 1).y).toBeGreaterThan(confettiAt({ ...p, delay: 0 }, 0.3).y);
  });
});

describe('shouldBurst — « réduire les animations » coupe TOUJOURS la gerbe', () => {
  it('part à la demande', () => {
    expect(shouldBurst(1, false)).toBe(true);
    expect(shouldBurst(3, false)).toBe(true);
  });

  it('ne part pas sans demande', () => {
    expect(shouldBurst(0, false)).toBe(false);
  });

  it('ne part jamais en mouvement réduit, même demandée', () => {
    expect(shouldBurst(1, true)).toBe(false);
  });
});
