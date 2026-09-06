/**
 * `@esport237hub/types` duplique en dur la liste des skins intégrés NON
 * premium (`FREE_CARD_SKIN_KEYS`) — il ne peut pas importer `@esport237hub/ui`
 * (paquet React) sans casser le mobile/le site vitrine, voir
 * `scripts/check-purity.ts`. Ce test est le garde-fou qui empêche les deux
 * listes de diverger quand un skin change de statut premium ici.
 */
import { describe, expect, test } from 'bun:test';

import { DEFAULT_CARD_SKIN_KEY, FREE_CARD_SKIN_KEYS } from '@esport237hub/types';

import { BUILTIN_SKIN_KEYS, BUILTIN_SKINS, DEFAULT_SKIN_KEY, GLOBAL_SKIN_KEY } from './spec';

describe('FREE_CARD_SKIN_KEYS (packages/types) vs BUILTIN_SKINS (packages/ui)', () => {
  test('correspond exactement aux skins intégrés non premium, hors « global »', () => {
    const expected = BUILTIN_SKIN_KEYS.filter(
      (key) => !BUILTIN_SKINS[key].premium && key !== GLOBAL_SKIN_KEY,
    ).sort();
    expect([...FREE_CARD_SKIN_KEYS].sort()).toEqual(expected);
  });

  test('DEFAULT_CARD_SKIN_KEY correspond à DEFAULT_SKIN_KEY et est libre', () => {
    expect(DEFAULT_CARD_SKIN_KEY).toBe(DEFAULT_SKIN_KEY);
    expect(FREE_CARD_SKIN_KEYS).toContain(DEFAULT_CARD_SKIN_KEY);
  });
});
