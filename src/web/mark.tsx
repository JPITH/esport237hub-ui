/**
 * Le SIGNE de la marque en SVG (web) — jumeau de `./native/mark`.
 *
 * Les tracés viennent de `../lib/brand-mark` : ce fichier ne décide de RIEN
 * de la forme, il pose seulement les encres. Le natif parcourt la même liste
 * et les icônes des stores sont rastérisées depuis le même module — un signe,
 * trois plateformes, aucun décalage possible.
 *
 * Les encres sont des variables CSS, jamais des hex : le signe suit donc le
 * thème clair/sombre comme le reste de l'application (DESIGN.md, règle 4).
 * `contrast` vaut `currentColor` — poser le signe dans un bouton d'accent lui
 * fait prendre la couleur du texte du bouton, sans props supplémentaire.
 */
import type { CSSProperties } from "react";

import { MARK_VIEW_BOX, markParts, type MarkPartRole, type MarkVariant } from "../lib/brand-mark";

/** Encre de chaque rôle. `contrast` hérite de la couleur de texte courante. */
const INK: Record<MarkPartRole, string> = {
  accent: "var(--e237-accent)",
  contrast: "currentColor",
  onAccent: "var(--e237-on-accent)",
};

export interface AppMarkProps {
  /** Côté du carré, en pixels (défaut 32). */
  size?: number;
  /**
   * Force le dessin. Par défaut, `markParts()` choisit : contour au-dessus de
   * 20 px, silhouette pleine en dessous — le contour se bouche à 16 px.
   */
  variant?: MarkVariant;
  /**
   * Libellé accessible. Absent, le signe est DÉCORATIF (`aria-hidden`) : il
   * accompagne presque toujours le mot-symbole, qui porte déjà le nom.
   */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function AppMark({ size = 32, variant, title, className = "", style }: AppMarkProps) {
  const parts = markParts(size, variant);
  return (
    <svg
      viewBox={MARK_VIEW_BOX}
      width={size}
      height={size}
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {parts.map((part) => (
        <path key={part.key} d={part.d} fill={INK[part.role]} fillRule="nonzero" />
      ))}
    </svg>
  );
}
