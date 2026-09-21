/**
 * Initiales d'un avatar de repli — logique pure, partagée web ↔ natif.
 *
 * Il n'y avait PAS de règle commune : le web laissait Astryx dériver deux
 * lettres d'un nom complet, le natif prenait `name.charAt(0)`. Le même joueur
 * s'affichait donc « SA » dans le tableau de bord et « S » sur le téléphone,
 * et un pseudo commençant par un emoji ou un underscore rendait une pastille
 * vide, puisque `charAt(0)` ne cherche pas la première LETTRE.
 *
 * Règles, dans l'ordre :
 *  1. deux mots ou plus → première lettre des deux premiers mots (« Sopgwi
 *     Armel » → « SA ») ;
 *  2. un seul mot → ses deux premières lettres (« mbappe » → « MB »), parce
 *     qu'une seule lettre distingue mal deux joueurs d'une même liste ;
 *  3. rien d'exploitable (vide, emoji seul, ponctuation) → « ? », jamais une
 *     pastille muette.
 *
 * Les séparateurs de pseudo (`_`, `-`, `.`) comptent comme des espaces :
 * « jean_pierre » rend « JP », comme « Jean Pierre ».
 */

/** Longueur maximale rendue — au-delà, la pastille ne tient plus. */
const MAX_LETTERS = 2;

/** Découpe sur les espaces ET les séparateurs de pseudo. */
const SEPARATORS = /[\s_\-.·|]+/;

/** Tout ce qui n'est ni lettre ni chiffre : accents conservés. */
const NOT_ALPHANUM = /[^\p{L}\p{N}]/gu;

/**
 * Rend 1 à 2 caractères en capitales, ou « ? ».
 *
 * @param name nom affiché, pseudo, ou `null` (profil non chargé).
 */
export function initials(name: string | null | undefined): string {
  if (typeof name !== 'string') return '?';

  const words = name
    .trim()
    .split(SEPARATORS)
    .map((word) => word.replace(NOT_ALPHANUM, ''))
    .filter((word) => word.length > 0);

  if (words.length === 0) return '?';

  const letters =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`
      : words[0].slice(0, MAX_LETTERS);

  // `toLocaleUpperCase` sans locale : « i » turc mis à part, c'est le
  // comportement attendu, et le design system ne connaît pas la langue du nom.
  return letters.toLocaleUpperCase();
}
