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
