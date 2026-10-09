/**
 * Décision de fin de geste pour la poignée d'une feuille modale.
 *
 * Sorti de `sheet.tsx` pour une seule raison : c'est la seule logique non
 * triviale de la feuille (trois issues, deux seuils, une vitesse signée) et
 * elle est testable ici sans monter React Native.
 */

/** Vitesse (px/s) au-delà de laquelle un geste vertical est « franc ». */
export const FLICK = 900;
/** Distance tirée vers le bas qui vaut fermeture, même sans vitesse. */
export const DISMISS_DISTANCE = 90;

/** Plafond par défaut d'une feuille au repos, en fraction de l'écran. */
export const SHEET_MAX_HEIGHT = 0.88;
/** Plafond d'une feuille agrandie à la poignée : le fond reste touchable. */
export const SHEET_EXPANDED_HEIGHT = 0.92;
/** Plancher d'un plafond demandé : en dessous, la feuille n'a plus de corps. */
const SHEET_MIN_RATIO = 0.4;

/**
 * Les deux plafonds d'une feuille, en points, pour un écran de `height`.
 *
 * `ratio` est le plafond AU REPOS voulu par l'appelant (0,8 pour une
 * conversation) ; il est borné entre 0,4 et le plafond agrandi, et la
 * position agrandie ne descend jamais sous lui — tirer la poignée vers le
 * haut ne doit pas RÉDUIRE la feuille.
 */
export function sheetCaps(
  height: number,
  ratio: number = SHEET_MAX_HEIGHT,
): { collapsedMax: number; expandedMax: number } {
  const safe = Number.isFinite(ratio) ? ratio : SHEET_MAX_HEIGHT;
  const bounded = Math.min(SHEET_EXPANDED_HEIGHT, Math.max(SHEET_MIN_RATIO, safe));
  return {
    collapsedMax: Math.round(height * bounded),
    expandedMax: Math.round(height * SHEET_EXPANDED_HEIGHT),
  };
}

export type SnapDecision =
  /** On s'en va : l'appelant referme la feuille. */
  | { close: true }
  /** On reste, en glissant vers cette position. */
  | { close: false; to: number };

/**
 * @param pos     Position courante : > 0 = pixels gagnés en hauteur,
 *                < 0 = pixels dont la feuille est descendue.
 * @param velocityY Vitesse verticale en fin de geste (positif = vers le bas).
 * @param room    Ce qu'il restait à gagner en hauteur depuis la position basse.
 */
export function decideSnap(pos: number, velocityY: number, room: number): SnapDecision {
  'worklet';
  if (velocityY > FLICK || pos < -DISMISS_DISTANCE) {
    // Depuis le plein écran, un geste franc vers le bas veut RÉDUIRE, pas
    // fermer : faire disparaître la feuille d'un cran serait une perte de
    // contexte que personne n'a demandée. On ne ferme que depuis le bas.
    return pos > 0 ? { close: false, to: 0 } : { close: true };
  }
  // Sans vitesse, c'est la position qui tranche : la moitié du chemin.
  const up = velocityY < -FLICK || pos > room / 2;
  return { close: false, to: up ? room : 0 };
}
