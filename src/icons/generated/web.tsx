// FICHIER GÉNÉRÉ par scripts/icons.ts — ne pas modifier à la main.
// Source : src/icons/svg/*.svg. Le gabarit vit dans scripts/icons.ts.
import type { CSSProperties } from 'react';

import type { IconName } from '../names';
import { ICON_ACTIVE_OPACITY, ICON_GLYPHS, ICON_STROKE_WIDTH, ICON_VIEW_BOX } from './data';

export interface IconProps {
  /** Nom de l'icône dans le jeu G-HUB. */
  name: IconName;
  /** Côté en pixels (défaut 24). */
  size?: number;
  /** Encre ; par défaut `currentColor` — l'icône suit le texte qui l'entoure. */
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
  className?: string;
  style?: CSSProperties;
}

/** Icône du jeu G-HUB en SVG en ligne — aucune couleur en dur. */
export function Icon({
  name,
  size = 24,
  color = 'currentColor',
  active = false,
  filled = false,
  strokeWidth = ICON_STROKE_WIDTH,
  accessibilityLabel,
  className,
  style,
}: IconProps) {
  const g = ICON_GLYPHS[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={ICON_VIEW_BOX}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="bevel"
      className={className}
      style={style}
      role={accessibilityLabel ? 'img' : undefined}
      aria-label={accessibilityLabel}
      aria-hidden={accessibilityLabel ? undefined : true}
      focusable="false"
      data-icon={name}
    >
      {(active || filled) &&
        g.a?.map((d, i) => (
          <path key={`a${i}`} d={d} fill={color} fillOpacity={filled ? 1 : ICON_ACTIVE_OPACITY} stroke="none" />
        ))}
      {g.s?.map((d, i) => <path key={`s${i}`} d={d} />)}
      {g.f?.map((d, i) => <path key={`f${i}`} d={d} fill={color} stroke="none" />)}
    </svg>
  );
}
