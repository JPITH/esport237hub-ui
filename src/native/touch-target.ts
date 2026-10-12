/**
 * Cible tactile d'au moins 44 × 44 autour d'un visuel plus petit — PUR et
 * testé (`touch-target.test.ts`).
 *
 * Audit UI/UX du 12/10/2026 : retour 36 px, cœurs 32, quantité 32, cloche et
 * avatar 34, « + » du solde 24… `hitSlop` n'agrandit la zone que sur iOS et
 * Android — react-native-web l'ignore — et il ne se voit dans aucune mesure.
 * Ici la zone EST la boîte : 44 px, centrée sur le visuel, et une marge
 * négative qui rend à la mise en page exactement la place du visuel. Rien ne
 * bouge à l'écran ; seul le doigt gagne de la marge.
 */
import type { ViewStyle } from 'react-native';

/** Plancher des cibles tactiles (DESIGN.md, WCAG 2.5.5 / Material 48 dp). */
export const MIN_TOUCH = 44;

/**
 * Style de la boîte tactile d'un visuel `width × height` (carré si `height`
 * est omis). Au-delà de 44 px, la boîte est le visuel lui-même : rien à
 * ajouter.
 */
export function touchTargetBox(width: number, height: number = width): ViewStyle {
  const padX = Math.max(0, (MIN_TOUCH - width) / 2);
  const padY = Math.max(0, (MIN_TOUCH - height) / 2);
  if (padX === 0 && padY === 0) return {};
  return {
    minWidth: Math.max(MIN_TOUCH, width),
    minHeight: Math.max(MIN_TOUCH, height),
    marginHorizontal: padX ? -padX : 0,
    marginVertical: padY ? -padY : 0,
    alignItems: 'center',
    justifyContent: 'center',
  };
}
