/**
 * Garde la liste des skins libres de `@esport237hub/types`
 * (`FREE_CARD_SKIN_KEYS`, celle que l'API accepte sur `POST /players`) alignée
 * sur les skins intégrés NON premium de ce paquet — la seule source de vérité
 * de « premium ». L'API ne peut pas importer `@esport237hub/ui` (paquet
 * React) ; ce test est le lien entre les deux.
 *
 * Ce dépôt vit aussi seul (hors monorepo), sans `@esport237hub/types`
 * installable : le test est alors ignoré, pas cassé.
 */
import { describe, expect, test } from 'bun:test';

import { BUILTIN_SKINS, BUILTIN_SKIN_KEYS, DEFAULT_SKIN_KEY, GLOBAL_SKIN_KEY } from './spec';

type TypesModule = {
  FREE_CARD_SKIN_KEYS: readonly string[];
  DEFAULT_CARD_SKIN_KEY: string;
};

let types: TypesModule | null = null;
try {
  types = (await import('@esport237hub/types')) as TypesModule;
} catch {
  types = null;
}

describe('FREE_CARD_SKIN_KEYS (packages/types) vs BUILTIN_SKINS (packages/ui)', () => {
  test.skipIf(types === null)(
    'correspond exactement aux skins intégrés non premium, hors « global »',
    () => {
      const expected: string[] = BUILTIN_SKIN_KEYS.filter(
        (key) => !BUILTIN_SKINS[key].premium && key !== GLOBAL_SKIN_KEY,
      ).sort();
      const free: string[] = [...types!.FREE_CARD_SKIN_KEYS];
      expect(free.sort()).toEqual(expected);
    },
  );

  test.skipIf(types === null)('DEFAULT_CARD_SKIN_KEY correspond à DEFAULT_SKIN_KEY et est libre', () => {
    expect<string>(types!.DEFAULT_CARD_SKIN_KEY).toBe(DEFAULT_SKIN_KEY);
    const free: string[] = [...types!.FREE_CARD_SKIN_KEYS];
    expect(free).toContain(types!.DEFAULT_CARD_SKIN_KEY);
  });
});
