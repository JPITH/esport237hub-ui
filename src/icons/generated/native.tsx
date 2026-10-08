// FICHIER GÉNÉRÉ par scripts/icons.ts — ne pas modifier à la main.
// Source : src/icons/svg/*.svg. Le gabarit vit dans scripts/icons.ts.
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useE237Colors } from '../../native/core';
import type { IconName } from '../names';
import { ICON_ACTIVE_OPACITY, ICON_GLYPHS, ICON_STROKE_WIDTH, ICON_VIEW_BOX } from './data';

export interface IconProps {
  /** Nom de l'icône dans le jeu G-HUB. */
  name: IconName;
  /** Côté en pixels (défaut 24). */
  size?: number;
  /** Encre ; par défaut le texte primaire du thème (`useE237Colors`). */
  color?: string;
  /** Variante active (onglet sélectionné) : trait + aplat partiel. */
  active?: boolean;
  /**
   * Variante pleine : l'aplat de la variante active, à pleine encre — un état
   * coché (favori, note). Sans effet sur une icône sans aplat.
   */
  filled?: boolean;
  /** Épaisseur du trait (défaut 1,75 — la grammaire du jeu). */
  strokeWidth?: number;
  /** Libellé accessible ; absent, l'icône est décorative. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Icône du jeu G-HUB (react-native-svg) — aucune couleur en dur. */
export function Icon({
  name,
  size = 24,
  color,
  active = false,
  filled = false,
  strokeWidth = ICON_STROKE_WIDTH,
  accessibilityLabel,
  style,
  testID,
}: IconProps) {
  const c = useE237Colors();
  const ink = color ?? c.textPrimary;
  const g = ICON_GLYPHS[name];
  return (
    <Svg
      viewBox={ICON_VIEW_BOX}
      width={size}
      height={size}
      style={style}
      testID={testID}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      // `accessible` (vrai ou faux) descendrait jusqu'au DOM sous
      // react-native-web (« Received `true` for a non-boolean attribute ») :
      // natif seulement ; sur le web, rôle + libellé suffisent — voir mark.tsx.
      accessible={accessibilityLabel && Platform.OS !== 'web' ? true : undefined}
    >
      {(active || filled) &&
        g.a?.map((d, i) => (
          <Path key={`a${i}`} d={d} fill={ink} fillOpacity={filled ? 1 : ICON_ACTIVE_OPACITY} />
        ))}
      {g.s?.map((d, i) => (
        <Path key={`s${i}`} d={d} fill="none" stroke={ink} strokeWidth={strokeWidth} strokeLinejoin="bevel" />
      ))}
      {g.f?.map((d, i) => <Path key={`f${i}`} d={d} fill={ink} />)}
    </Svg>
  );
}
