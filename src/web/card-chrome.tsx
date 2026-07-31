/**
 * Chrome des cartes joueur FUT « Founders » — rendu SVG DOM.
 *
 * Jumeau web de `src/native/card-skins.tsx` : les deux consomment la MÊME liste
 * de tracé (`buildSkinDraw` de `../skins`), donc les mêmes polygones, les mêmes
 * arrêts de dégradé et les mêmes rayures aux mêmes coordonnées. C'est la parité
 * web / iOS / Android par construction, et non par recopie de valeurs.
 *
 * Les classes `.pcard--<skin>` n'existent plus : un skin est une donnée, et un
 * skin créé dans le dashboard s'affiche sans une ligne de CSS supplémentaire.
 */
"use client";

import { useId, useMemo, type CSSProperties, type ReactNode } from "react";

import { buildSkinDraw, skinAnimated, type SkinDraw } from "../skins/geometry";
import { skinCssVars } from "../skins/css";
import type { SkinSpec } from "../skins/spec";
import { useSkin } from "../skins/context";

/** Ce qu'un composant de carte accepte pour son apparence. */
export type CardSkinInput = string | SkinSpec;

/** Traduit la liste de tracé partagée en SVG DOM. */
function CardArtwork({ draw }: { draw: SkinDraw }) {
  return (
    <svg
      className="pcard__art"
      viewBox={`0 0 ${draw.width} ${draw.height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id={draw.frame.id}
          x1={draw.frame.x1}
          y1={draw.frame.y1}
          x2={draw.frame.x2}
          y2={draw.frame.y2}
        >
          {draw.frame.stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        <linearGradient
          id={draw.surface.id}
          x1={draw.surface.x1}
          y1={draw.surface.y1}
          x2={draw.surface.x2}
          y2={draw.surface.y2}
        >
          {draw.surface.stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
        {draw.radials.map((r) => (
          <radialGradient key={r.id} id={r.id} cx={r.cx} cy={r.cy} r={r.r}>
            <stop offset="0" stopColor={r.color} stopOpacity={r.opacity} />
            <stop offset="1" stopColor={r.color} stopOpacity={0} />
          </radialGradient>
        ))}
        <clipPath id={draw.clipId}>
          <polygon points={draw.surfacePoints} />
        </clipPath>
      </defs>

      {/* Liseré extérieur puis surface intérieure. */}
      <polygon points={draw.framePoints} fill={`url(#${draw.frame.id})`} />
      <polygon points={draw.surfacePoints} fill={`url(#${draw.surface.id})`} />

      {/* Halos et rayures, bornés à la surface. */}
      <g clipPath={`url(#${draw.clipId})`}>
        {draw.radials.map((r) => (
          <rect key={r.id} width={draw.width} height={draw.height} fill={`url(#${r.id})`} />
        ))}
        {draw.stripes.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.color}
            strokeOpacity={l.opacity}
            strokeWidth={l.width}
          />
        ))}
      </g>

      {/* Anneau intérieur brillant. */}
      <polygon points={draw.surfacePoints} fill="none" stroke={draw.inner} />
    </svg>
  );
}

/**
 * Balayage « foil » des skins premium. Le natif translate une View en pixels ;
 * ici l'animation est en POURCENTAGES (donc indépendante de la taille) et
 * portée par le CSS — mêmes durées, même inclinaison, même largeur de bande
 * que la liste de tracé. Coupée par `prefers-reduced-motion`.
 */
function CardSheen({ draw }: { draw: SkinDraw }) {
  const sheen = draw.sheen;
  if (!sheen) return null;
  const pct = (px: number) => `${((px / draw.width) * 100).toFixed(2)}%`;
  const style = {
    "--pc-sheen-color": sheen.color,
    "--pc-sheen-opacity": String(sheen.opacity),
    "--pc-sheen-width": pct(sheen.width),
    "--pc-sheen-from": pct(sheen.from),
    "--pc-sheen-to": pct(sheen.to),
    "--pc-sheen-skew": `${sheen.skewDeg}deg`,
    "--pc-sheen-duration": `${sheen.periodMs}ms`,
    top: `${((sheen.top / draw.height) * 100).toFixed(2)}%`,
    height: `${((sheen.height / draw.height) * 100).toFixed(2)}%`,
  } as CSSProperties;

  return <span className="pcard__sheen" style={style} aria-hidden />;
}

export interface CardChromeProps {
  /** Clé de skin (intégrée ou boutique) ou spec complet. */
  skin: CardSkinInput;
  /** Force le foil même sur un skin non premium (aperçu de l'éditeur). */
  animated?: boolean;
  className?: string;
  /** Surcharges ponctuelles (l'éditeur de skins n'en a plus besoin). */
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Enveloppe visuelle d'une carte : ratio 63/88, bouclier « Founders » tracé en
 * SVG, foil animé si premium. Expose les variables `--pc-*` de texte pour le
 * contenu (voir `skinCssVars`).
 */
export function CardChrome({
  skin,
  animated = false,
  className = "",
  style,
  children,
}: CardChromeProps) {
  const spec = useSkin(skin);
  /* Ids uniques par instance : plusieurs cartes coexistent dans le document et
     des `id` de dégradé dupliqués feraient gagner le premier `<defs>` vu. */
  const uid = `pc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const draw = useMemo(() => buildSkinDraw(spec, uid), [spec, uid]);
  const showSheen = skinAnimated(spec, animated);

  return (
    <div
      className={`pcard ${showSheen ? "pcard--animated" : ""} ${className}`}
      style={{ ...skinCssVars(spec), ...style } as CSSProperties}
    >
      <CardArtwork draw={draw} />
      {showSheen ? <CardSheen draw={draw} /> : null}
      <div className="pcard__content">{children}</div>
    </div>
  );
}
