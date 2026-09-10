/**
 * Le SIGNE de la marque en SVG (natif) — jumeau de `../web/mark`.
 *
 * Même liste de tracés (`../lib/brand-mark`), même ordre de peinture. Les
 * encres viennent de `useE237Colors()` : le signe suit le thème du système
 * comme le reste de l'application, sans hex posé dans le rendu (DESIGN.md,
 * règle 4).
 */
import Svg, { Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  MARK_VIEW_BOX,
  markParts,
  type MarkPartRole,
  type MarkVariant,
} from '../lib/brand-mark';
import { useE237Colors } from './core';

export interface AppMarkProps {
  /** Côté du carré, en pixels (défaut 32). */
  size?: number;
  /** Force le dessin ; par défaut contour au-dessus de 20 px, plein en dessous. */
  variant?: MarkVariant;
  /**
   * Libellé accessible. Absent, le signe est décoratif : il accompagne presque
   * toujours le mot-symbole, qui porte déjà le nom du produit.
   */
  title?: string;
  /** Encre du trait clair — par défaut le texte primaire du thème. */
  contrast?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppMark({ size = 32, variant, title, contrast, style }: AppMarkProps) {
  const c = useE237Colors();
  const ink: Record<MarkPartRole, string> = {
    accent: c.accent,
    contrast: contrast ?? c.textPrimary,
    onAccent: c.onAccent,
  };

  return (
    <Svg
      viewBox={MARK_VIEW_BOX}
      width={size}
      height={size}
      style={style}
      accessibilityRole={title ? 'image' : undefined}
      accessibilityLabel={title}
      // `accessible={false}` (et non `undefined`) descendait jusqu'au DOM via
      // react-native-svg et faisait crier React : « Received `false` for a
      // non-boolean attribute ». Le logo est dans la barre du haut de tous les
      // écrans, donc l'erreur s'affichait partout en développement.
      accessible={title ? true : undefined}>
      {markParts(size, variant).map((part) => (
        <Path key={part.key} d={part.d} fill={ink[part.role]} fillRule="nonzero" />
      ))}
    </Svg>
  );
}
