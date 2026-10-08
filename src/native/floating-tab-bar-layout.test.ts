import { describe, expect, it } from 'bun:test';

import {
  CONTENT_BREATHING,
  PILL_HEIGHT,
  PILL_MIN_BOTTOM_GAP,
  tabBarBottomOffset,
  tabBarReserve,
} from './floating-tab-bar-layout';

describe('tabBarBottomOffset — où se pose la pilule', () => {
  it('se pose sur la zone sûre quand le téléphone en a une', () => {
    expect(tabBarBottomOffset(34)).toBe(34);
  });

  it('garde un écart minimal sans zone sûre : collée au bord, ce serait une barre', () => {
    expect(tabBarBottomOffset(0)).toBe(PILL_MIN_BOTTOM_GAP);
    expect(tabBarBottomOffset(4)).toBe(PILL_MIN_BOTTOM_GAP);
  });

  it('tolère une valeur absurde plutôt que de poser la pilule hors écran', () => {
    expect(tabBarBottomOffset(-10)).toBe(PILL_MIN_BOTTOM_GAP);
    expect(tabBarBottomOffset(Number.NaN)).toBe(PILL_MIN_BOTTOM_GAP);
  });
});

describe('tabBarReserve — la marge basse des écrans à onglets', () => {
  it('couvre la pilule, son écart au bord et un peu d’air', () => {
    expect(tabBarReserve(0)).toBe(PILL_MIN_BOTTOM_GAP + PILL_HEIGHT + CONTENT_BREATHING);
  });

  it('inclut la zone sûre une seule fois', () => {
    expect(tabBarReserve(34)).toBe(34 + PILL_HEIGHT + CONTENT_BREATHING);
  });

  it('laisse toujours la dernière ligne au-dessus de la pilule', () => {
    for (const inset of [0, 16, 24, 34, 48]) {
      expect(tabBarReserve(inset)).toBeGreaterThan(tabBarBottomOffset(inset) + PILL_HEIGHT);
    }
  });
});
