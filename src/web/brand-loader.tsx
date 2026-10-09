/**
 * L'écran de chargement de G-HUB (web) — jumeau de `../native/brand-loader`.
 *
 * Retour du porteur (08/10/2026) : « l'écran de chargement : il faut un
 * motion design du logo etc, plutôt qu'un spinner et le texte "chargement" ».
 * Le signe se TRACE : le cadre hexagonal à la plume, puis le « G » et le « H »
 * qui s'y posent, une respiration, et on recommence (partition :
 * `lib/brand-motion.ts`). Les tracés sont ceux de `lib/brand-mark.ts`, et
 * seulement eux ; les encres sont des rôles (`--e237-accent`, texte courant).
 *
 * Ce que ce composant n'est PAS : un remplaçant du petit `Spinner` d'un
 * bouton ou d'un bloc qui se recharge. Il dit « l'application arrive » — une
 * page entière, une route, le démarrage.
 *
 * « Réduire les animations » : le signe complet, immobile (CSS du DS).
 * Le lecteur d'écran entend « Chargement de G-HUB… » (`role="status"`).
 */
import type { CSSProperties } from "react";

import { useDsT } from "../i18n";
import {
  MARK_CROSSBAR_SHADE_PATH,
  MARK_LETTER_G_PATH,
  MARK_LETTER_H_PATH,
  MARK_RING_PATH,
  MARK_VIEW_BOX,
} from "../lib/brand-mark";

export interface BrandLoaderProps {
  /** Côté du signe, en pixels (défaut 72). */
  size?: number;
  /** Ce que lit le lecteur d'écran ; défaut « Chargement de G-HUB… ». */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

export function BrandLoader({ size = 72, label, className = "", style }: BrandLoaderProps) {
  const t = useDsT();
  return (
    <span
      role="status"
      aria-live="polite"
      className={`e237-brand-loader ${className}`.trim()}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        viewBox={MARK_VIEW_BOX}
        width={size}
        height={size}
        aria-hidden
        focusable="false"
        className="e237-brand-loader__mark"
      >
        {/* `pathLength` normalise le pointillé : le cadre se trace de 0 à 1,
            quelle que soit sa taille réelle. */}
        <path className="e237-brand-loader__ring" d={MARK_RING_PATH} pathLength={1} />
        <path className="e237-brand-loader__g" d={MARK_LETTER_G_PATH} />
        <path className="e237-brand-loader__h" d={MARK_LETTER_H_PATH} />
        <path className="e237-brand-loader__shade" d={MARK_CROSSBAR_SHADE_PATH} />
      </svg>
      <span className="e237-visually-hidden">{label ?? t("ui.loader.label")}</span>
    </span>
  );
}

export interface PageLoaderProps {
  /**
   * Plein écran (démarrage, garde de session) : occupe toute la hauteur de la
   * fenêtre. Sinon, la zone de contenu d'une page (route qui charge).
   */
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

/**
 * Le chargement d'une PAGE : le signe animé, centré, qui n'apparaît qu'après
 * un court instant (un chargement de 100 ms ne doit pas faire clignoter le
 * logo).
 */
export function PageLoader({ fullScreen = false, label, className = "" }: PageLoaderProps) {
  return (
    <div
      className={`e237-page-loader ${fullScreen ? "e237-page-loader--screen" : ""} ${className}`.trim()}
    >
      <BrandLoader size={fullScreen ? 88 : 64} label={label} />
    </div>
  );
}
