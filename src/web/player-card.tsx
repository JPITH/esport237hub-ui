import type { CSSProperties } from "react";
import { UserRound } from "lucide-react";

import { cardStats, cityAbbr } from "../lib/player-stats";
import { Flag } from "./flag";

/** Skins cosmétiques de la carte (achetables plus tard sur le store). */
export type CardSkin =
  | "signature"
  | "emerald"
  | "gold"
  | "champion"
  | "indomptable"
  | "heritage237"
  | "nuit-douala";

/**
 * Skins PREMIUM vendables : fond exclusif + balayage « foil » et halo animés
 * (transform/opacity uniquement — quasi gratuit, coupé par
 * prefers-reduced-motion). Mêmes palettes que le mobile (`card-skins.tsx`).
 */
export const PREMIUM_SKINS: CardSkin[] = [
  "indomptable",
  "heritage237",
  "nuit-douala",
];

export const SKIN_LABELS: Record<CardSkin, string> = {
  signature: "Signature",
  emerald: "Émeraude",
  gold: "Or",
  champion: "Champion",
  indomptable: "Indomptable",
  heritage237: "237 Héritage",
  "nuit-douala": "Nuit de Douala",
};

/** Photo du joueur, ou fallback silhouette (en attendant le socle médias). */
function CardImage({
  imageUrl,
  alt,
}: {
  imageUrl?: string | null;
  alt: string;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className="pcard__photo"
        src={imageUrl}
        alt={alt}
        width={180}
        height={150}
      />
    );
  }
  return (
    <span className="pcard__imgph" aria-hidden>
      <UserRound strokeWidth={1.25} />
    </span>
  );
}

/** Colonne badge : OVR + abrégé ville + drapeau (à la place du poste). */
function CardBadge({
  ovr,
  tag,
  cityText,
  country,
}: {
  ovr: number;
  tag?: string;
  cityText: string;
  country: string;
}) {
  return (
    <div className="pcard__badge">
      <span className="pcard__ovr">{ovr}</span>
      <span className="pcard__ovrlabel">{tag ?? "OVR"}</span>
      <span className="pcard__pos">{cityText}</span>
      <span className="pcard__rule" />
      <Flag country={country} className="pcard__flag" />
    </div>
  );
}

export interface PlayerCardProps {
  username: string;
  rating: number;
  wins: number;
  city?: string | null;
  gameSlug?: string;
  gameName?: string;
  stats?: Record<string, number> | null;
  skin?: CardSkin;
  imageUrl?: string | null;
  country?: string;
  className?: string;
  /** Styles inline (ex. surcharge des variables --pc-* pour l'éditeur de skins). */
  style?: CSSProperties;
  /** Force les effets premium (halo + foil) — utile pour l'éditeur de skins. */
  animated?: boolean;
}

/**
 * Carte joueur façon FUT (un même template pour tous les jeux) : OVR + ville +
 * drapeau, nom surmonté des victoires, stats du bas selon la catégorie du jeu.
 */
export function PlayerCard({
  username,
  rating,
  wins,
  city,
  gameSlug,
  gameName,
  stats,
  skin = "signature",
  imageUrl,
  country = "CM",
  className = "",
  style,
  animated = false,
}: PlayerCardProps) {
  const skinClass = skin === "gold" ? "" : `pcard--${skin}`;
  const premium = PREMIUM_SKINS.includes(skin) || animated;
  const rows = cardStats({ gameSlug, rating, stats, seed: username });

  return (
    <div
      className={`pcard ${skinClass} ${premium ? "pcard--animated" : ""} ${className}`}
      style={style}
    >
      <div className="pcard__head">
        <CardBadge ovr={rating} cityText={cityAbbr(city)} country={country} />
        <div className="pcard__img">
          <CardImage imageUrl={imageUrl} alt={username} />
        </div>
      </div>

      <div className="pcard__name-wrap">
        <div>
          <span className="pcard__wins">{wins}</span>
          <span className="pcard__wins-lbl">VICT.</span>
        </div>
        <div className="pcard__name">{username}</div>
        {gameName ? <div className="pcard__meta">{gameName}</div> : null}
      </div>

      <div className="pcard__stats">
        {rows.map((s) => (
          <div key={s.abbr} className="pcard__stat" title={s.label}>
            <b>{s.value}</b>
            <span>{s.abbr}</span>
          </div>
        ))}
      </div>

      {premium ? <span className="pcard__sheen" aria-hidden /> : null}
    </div>
  );
}

const GAME_CODE: Record<string, string> = {
  fc27: "FC",
  "clash-royale": "CR",
  "call-of-duty": "COD",
  "pubg-mobile": "PUB",
  valorant: "VAL",
};

function gameCode(slug: string | undefined, name: string): string {
  if (slug && GAME_CODE[slug]) return GAME_CODE[slug];
  return name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
}

export interface GlobalCardCard {
  gameSlug?: string;
  gameName: string;
  rating: number;
}

export interface GlobalCardProps {
  username: string;
  cards: GlobalCardCard[];
  points: number;
  wins: number;
  losses: number;
  platform?: string | null;
  city?: string | null;
  imageUrl?: string | null;
  country?: string;
  /** Défaut = global ; "champion" pour le n°1 du classement global. */
  skin?: "global" | "champion";
  className?: string;
}

/**
 * Carte globale (identité tous jeux) — même template/hauteur que la carte FUT.
 * OVR = MOYENNE des notes de toutes les disciplines ; les stats du bas listent
 * les jeux joués et leur note. Points, plateforme et V/D sous le nom.
 */
export function GlobalCard({
  username,
  cards,
  points,
  wins,
  losses,
  platform,
  city,
  imageUrl,
  country = "CM",
  skin = "global",
  className = "",
}: GlobalCardProps) {
  // OVERALL = MEILLEURE note (décision du porteur — pas la moyenne).
  const overall = cards.length ? Math.max(...cards.map((c) => c.rating)) : 0;
  const cells = cards.slice(0, 6);

  return (
    <div className={`pcard pcard--${skin} ${className}`}>
      <div className="pcard__head">
        <CardBadge
          ovr={overall}
          tag="GLB"
          cityText={cityAbbr(city)}
          country={country}
        />
        <div className="pcard__img">
          <CardImage imageUrl={imageUrl} alt={username} />
        </div>
      </div>

      <div className="pcard__name-wrap">
        <div>
          <span className="pcard__wins">{wins}</span>
          <span className="pcard__wins-lbl">VICT.</span>
        </div>
        <div className="pcard__name">{username}</div>
        <div className="pcard__meta">
          {points} pts
          {platform ? ` · ${platform.toUpperCase()}` : ""} · {wins}V/{losses}D
        </div>
      </div>

      <div className="pcard__stats">
        {cells.length ? (
          cells.map((c) => (
            <div key={c.gameName} className="pcard__stat" title={c.gameName}>
              <b>{c.rating}</b>
              <span>{gameCode(c.gameSlug, c.gameName)}</span>
            </div>
          ))
        ) : (
          <span className="text-xs opacity-70">Aucune discipline active.</span>
        )}
      </div>
    </div>
  );
}
