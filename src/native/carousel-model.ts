/**
 * Carrousel — les règles sans React Native, pures et testées
 * (`carousel-model.test.ts`, sous `bun test`). Le rendu : `./carousel.tsx`.
 */

/** L'élément suivant d'un défilement automatique : le dernier revient au premier. */
export function nextCarouselIndex(current: number, count: number): number {
  if (count <= 1) return 0;
  return (current + 1) % count;
}

/**
 * L'élément calé à l'écran pour un décalage horizontal `offsetX`, borné à la
 * liste : le rebond d'une `ScrollView` rend un décalage NÉGATIF (« élément 0
 * sur 3 » le temps du retour), et la fin de piste peut dépasser le dernier pas.
 */
export function carouselIndexAt(offsetX: number, step: number, count: number): number {
  if (step <= 0 || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(offsetX / step)));
}
