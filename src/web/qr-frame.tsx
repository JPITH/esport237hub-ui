"use client";

import type { ReactNode } from "react";

export interface QrFrameProps {
  /**
   * Le QR rendu par l'application (`qrcode` côté web,
   * `react-native-qrcode-svg` côté natif). Absent = squelette de chargement.
   */
  children?: ReactNode;
  /** Côté du cadre en pixels (défaut 140). */
  size?: number;
  /**
   * Le code a déjà servi : on le grise sans le retirer, pour que le porteur
   * comprenne qu'il s'agit bien de SON billet, déjà scanné.
   */
  used?: boolean;
  /** Description accessible (« QR de check-in du billet »). */
  label?: string;
  className?: string;
}

/**
 * Cadre d'un QR code — plateau clair, coins arrondis, état « déjà utilisé ».
 *
 * Le design system n'ENCODE pas le QR : l'encodage dépend d'une bibliothèque
 * par plateforme et un code mal encodé casse silencieusement le contrôle à
 * l'entrée. Il fournit le cadre commun au billet (web et natif) : dimension
 * fixe, squelette de chargement, état « déjà utilisé ».
 *
 * Le code fourni doit embarquer sa PROPRE zone tranquille claire (option
 * `margin` de `qrcode`, `quietZone` de `react-native-qrcode-svg`) : c'est ce
 * qui le rend scannable dans les deux thèmes sans poser une seule couleur en
 * dur dans l'interface.
 */
export function QrFrame({
  children,
  size = 140,
  used = false,
  label = "QR code",
  className = "",
}: QrFrameProps) {
  if (!children) {
    return (
      <div
        className={`ui-skeleton rounded-lg ${className}`.trim()}
        style={{ width: size, height: size }}
        aria-label={`${label} — chargement`}
        role="img"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={used ? `${label} — déjà utilisé` : label}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-lg ${
        used ? "opacity-40 grayscale" : ""
      } ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
