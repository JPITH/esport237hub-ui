import { describe, expect, it } from 'bun:test';

import {
  MARK_CROSSBAR_SHADE_PATH,
  MARK_HEX_SOLID_PATH,
  MARK_LETTER_G_PATH,
  MARK_LETTER_H_PATH,
  MARK_RING_PATH,
} from './brand-mark';
import { BRAND_LOADER_TIMELINE, polylinePathLength, stageProgress } from './brand-motion';

describe('polylinePathLength — mesurer le signe sans le redessiner', () => {
  it('un hexagone régulier a six côtés égaux à son rayon', () => {
    // Le cadre plein : rayon 373,51 → périmètre 6 × 373,51.
    expect(polylinePathLength(MARK_HEX_SOLID_PATH)).toBeCloseTo(6 * 373.51, 0);
  });

  it('l’anneau = contour extérieur + contour intérieur', () => {
    expect(polylinePathLength(MARK_RING_PATH)).toBeCloseTo(6 * 373.51 + 6 * 358.49, 0);
  });

  it('toutes les pièces du signe sont des polygones mesurables', () => {
    for (const d of [MARK_LETTER_G_PATH, MARK_LETTER_H_PATH, MARK_CROSSBAR_SHADE_PATH]) {
      const length = polylinePathLength(d);
      expect(Number.isFinite(length)).toBe(true);
      expect(length).toBeGreaterThan(0);
    }
  });

  it('refuse de deviner un tracé courbe', () => {
    expect(polylinePathLength('M 0 0 C 1 1 2 2 3 3')).toBeNaN();
  });
});

describe('la partition du mouvement', () => {
  it('chaque étape tient dans le cycle, dans l’ordre annoncé', () => {
    for (const [from, to] of Object.values(BRAND_LOADER_TIMELINE)) {
      expect(from).toBeGreaterThanOrEqual(0);
      expect(to).toBeLessThanOrEqual(1);
      expect(from).toBeLessThan(to);
    }
    expect(BRAND_LOADER_TIMELINE.ringDraw[0]).toBe(0);
    expect(BRAND_LOADER_TIMELINE.fadeOut[1]).toBe(1);
  });

  it('stageProgress est borné', () => {
    expect(stageProgress(0.1, [0.2, 0.4])).toBe(0);
    expect(stageProgress(0.3, [0.2, 0.4])).toBeCloseTo(0.5);
    expect(stageProgress(0.9, [0.2, 0.4])).toBe(1);
  });
});
