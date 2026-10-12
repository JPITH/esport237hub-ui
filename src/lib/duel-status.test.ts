import { describe, expect, it } from 'bun:test';
import {
  DUEL_STATUSES,
  DUEL_STATUS_COPY_EN,
  DUEL_STATUS_COPY_FR,
  DUEL_STATUS_TONE,
} from '@esport237hub/types';

import { en } from '../i18n/en';
import { fr } from '../i18n/fr';
import { DUEL_STATUS_META } from './duel-status';

/**
 * Le vocabulaire des statuts de duel vit dans `@esport237hub/types`
 * (`duel-status-view.ts`) ; le design system en garde une COPIE (il ne
 * dépend de `types` que pour ses types). Ce test les garde identiques : un
 * même duel ne doit plus s'appeler « Envoyée » ici et « Reçue » là.
 */
describe('statuts de duel — une seule copie', () => {
  it('chaque libellé du design system est celui de types, en français et en anglais', () => {
    for (const [key, label] of Object.entries(DUEL_STATUS_COPY_FR)) {
      expect(fr[key as keyof typeof fr] as string).toBe(label);
    }
    for (const [key, label] of Object.entries(DUEL_STATUS_COPY_EN)) {
      expect(en[key as keyof typeof en] as string).toBe(label);
    }
  });

  it('le ton de chaque statut est celui de types', () => {
    for (const status of DUEL_STATUSES) {
      expect(DUEL_STATUS_META[status].tone).toBe(DUEL_STATUS_TONE[status]);
    }
  });
});
