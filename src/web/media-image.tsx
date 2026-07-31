"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ImageOff } from "lucide-react";

/** Rayon d'arrondi, pris dans les tokens (`--e237-radius-*`). */
export type MediaRounded = "none" | "sm" | "md" | "lg" | "xl" | "full";

const RADIUS: Record<MediaRounded, string> = {
  none: "0",
  sm: "var(--e237-radius-sm)",
  md: "var(--e237-radius-md)",
  lg: "var(--e237-radius-lg)",
  xl: "var(--e237-radius-xl)",
  full: "var(--e237-radius-full)",
};

export interface MediaImageProps {
  /** URL distante ; `null`/`undefined` → repli visuel (jamais de carré cassé). */
  src?: string | null;
  /** Texte alternatif — obligatoire (produit, événement, salle…). */
  alt: string;
  /** Ratio largeur / hauteur (défaut 16 / 9). */
  ratio?: number;
  rounded?: MediaRounded;
  /** `cover` (défaut) remplit le cadre, `contain` montre le média entier. */
  fit?: "cover" | "contain";
  /** Icône Lucide de repli (défaut `ImageOff`). */
  fallbackIcon?: ReactNode;
  /** Courte légende sous l'icône de repli (ex. « Photo à venir »). */
  fallbackLabel?: string;
  className?: string;
  style?: CSSProperties;
}

type Status = "loading" | "ready" | "error";

/**
 * Image distante réutilisable (produits, événements, salles).
 *
 * - URL absente ou en erreur → repli illustré sur `surface-raised`, pas un
 *   carré cassé ;
 * - cadre à ratio fixe : la mise en page ne saute pas pendant le chargement ;
 * - état de chargement discret (shimmer `.ui-skeleton`, coupé par
 *   `prefers-reduced-motion`).
 */
export function MediaImage({
  src,
  alt,
  ratio = 16 / 9,
  rounded = "md",
  fit = "cover",
  fallbackIcon,
  fallbackLabel,
  className = "",
  style,
}: MediaImageProps) {
  const [status, setStatus] = useState<Status>(src ? "loading" : "error");

  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  const loading = Boolean(src) && status === "loading";
  const failed = !src || status === "error";

  return (
    <span
      className={`e237-media ${loading ? "ui-skeleton" : ""} ${className}`.trim()}
      style={{ aspectRatio: ratio, borderRadius: RADIUS[rounded], ...style }}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="e237-media__img"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectFit: fit, opacity: status === "ready" ? 1 : 0 }}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      ) : null}

      {failed ? (
        <span className="e237-media__ph" role="img" aria-label={alt}>
          {fallbackIcon ?? <ImageOff strokeWidth={1.25} aria-hidden />}
          {fallbackLabel ? (
            <span className="e237-media__phlabel">{fallbackLabel}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
