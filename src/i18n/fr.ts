/**
 * Dictionnaire français du design system — SOURCE DE VÉRITÉ.
 *
 * Découpé en fragments par domaine, comme `apps/mobile/src/lib/i18n` : un
 * fichier unique de 200 clés devient impossible à relire, et deux personnes qui
 * ajoutent une clé le même jour se marchent dessus.
 *
 * `en.ts` est typé `Record<keyof typeof fr, string>` : une clé anglaise
 * manquante ne compile pas.
 */
import { frCatalog } from './fr.catalog';
import { frForms } from './fr.forms';
import { frMoney } from './fr.money';
import { frRanking } from './fr.ranking';
import { frStatus } from './fr.status';
import { frUi } from './fr.ui';

export const fr = {
  ...frStatus,
  ...frCatalog,
  ...frMoney,
  ...frRanking,
  ...frForms,
  ...frUi,
} as const;
