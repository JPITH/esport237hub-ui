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

/**
 * Montant abrégé — `47,5 k FCFA`, `2,5 M FCFA`.
 *
 * Les sommes du produit sont en francs CFA : une recette de salle dépasse
 * couramment les six chiffres, et « 2 450 000 FCFA » écrit en toutes lettres
 * déborde d'une carte d'indicateur ou d'une pastille d'en-tête. La forme
 * abrégée est donc la règle **partout où le chiffre est un repère**.
 *
 * Elle ne l'est PAS là où l'on manipule réellement de l'argent — solde et
 * mouvements du portefeuille, formulaire de retrait. À ces endroits, une
 * approximation n'est pas une commodité, c'est une faute : on retire
 * 187 500 FCFA, pas « 188 k ». Ces écrans continuent d'appeler `formatXaf`.
 *
 * ⚠️ Toujours exposer la valeur exacte à côté (attribut `title`,
 * `aria-label`) : abréger ne doit jamais rendre le montant réel
 * inaccessible.
 *
 * @param from Seuil d'abréviation, six chiffres par défaut. En dessous, le
 *             montant reste écrit en entier — et ce n'est pas un réglage de
 *             confort : « 47,5 k FCFA » compte DEUX caractères de plus que
 *             « 47 500 FCFA », tout en étant moins précis. L'abréviation ne
 *             fait gagner de la place qu'à partir de six chiffres. Le test
 *             `money.test.ts` vérifie cette invariante sur toute la plage.
 */
export function formatXafCompact(
  amount: number | null | undefined,
  { from = 100_000 }: { from?: number } = {},
): string {
  const n =
    typeof amount === 'number' && Number.isFinite(amount) ? Math.round(amount) : 0;
  const abs = Math.abs(n);
  if (abs < from) return formatXaf(n);

  const [value, unit] = abs >= 1_000_000 ? [abs / 1_000_000, 'M'] : [abs / 1000, 'k'];

  // Une seule décimale, et aucune au-delà de 100 : « 187,5 k » reste lisible,
  // « 1 234,5 k » ne l'est plus — mais à ce stade on est déjà passé en M.
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  const text = String(rounded).replace('.', ',');

  return `${n < 0 ? '-' : ''}${text}${NBSP}${unit}${NBSP}FCFA`;
}

/** Prix d'un billet / d'une entrée : « Gratuit » quand le montant est nul. */
export function priceOrFreeLabel(amountXaf: number | null | undefined): string {
  return amountXaf && amountXaf > 0 ? formatXaf(amountXaf) : 'Gratuit';
}
