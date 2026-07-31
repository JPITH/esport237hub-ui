/**
 * Formatage des montants en FCFA — source de vérité unique.
 *
 * Le web (`apps/web/src/lib/money.ts → formatXaf`) et le natif
 * (`apps/mobile/src/lib/format.ts → formatFcfa`) écrivaient la même fonction
 * avec des séparateurs DIFFÉRENTS (espace fine insécable côté web, espace
 * simple côté natif) : le même montant ne s'écrivait pas pareil selon la
 * plateforme. On tranche ici pour l'espace fine insécable (U+202F), la règle
 * typographique française, et l'espace insécable (U+00A0) avant l'unité pour
 * que « FCFA » ne tombe jamais seul à la ligne.
 */

/** Espace fine insécable — séparateur de milliers. */
const THIN = String.fromCharCode(0x202f);
/** Espace insécable — colle l'unité au nombre. */
const NBSP = String.fromCharCode(0x00a0);

/** Ex. `formatXaf(2000)` → `2 000 FCFA`. Tolérant à `null` / `NaN` (→ 0). */
export function formatXaf(amount: number | null | undefined): string {
  const n =
    typeof amount === 'number' && Number.isFinite(amount) ? Math.round(amount) : 0;
  const grouped = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
  return `${n < 0 ? '-' : ''}${grouped}${NBSP}FCFA`;
}

/** Alias historique du natif — même sortie que `formatXaf`. */
export const formatFcfa = formatXaf;

/** Prix d'un billet / d'une entrée : « Gratuit » quand le montant est nul. */
export function priceOrFreeLabel(amountXaf: number | null | undefined): string {
  return amountXaf && amountXaf > 0 ? formatXaf(amountXaf) : 'Gratuit';
}
