import type { CSSProperties } from "react";
import { UserRound } from "lucide-react";

import { cardStats, cityAbbr, type StatDef } from "../lib/player-stats";
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

/**
 * Photo du joueur ; sinon PNG de fallback (silhouette IA fournie par l'app) ;
 * sinon icône silhouette.
 */
function CardImage({
  imageUrl,
  fallbackImageUrl,
  alt,
}: {
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  alt: string;
}) {
  const src = imageUrl ?? fallbackImageUrl;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className="pcard__photo"
        src={src}
        alt={imageUrl ? alt : ""}
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

/** Colonne badge : OVR + abrégé ville + drapeau + division. */
function CardBadge({
  ovr,
  tag,
  cityText,
  country,
  division,
}: {
  ovr: number;
  tag?: string;
  cityText: string;
  country: string;
  division?: string | null;
}) {
  return (
    <div className="pcard__badge">
      <span className="pcard__ovr">{ovr}</span>
      {tag ? <span className="pcard__ovrlabel">{tag}</span> : null}
      <span className="pcard__pos">{cityText}</span>
      <span className="pcard__flag">
        <Flag country={country} />
      </span>
      {division ? <span className="pcard__division">{division}</span> : null}
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
  /** Stats configurées par le back-office (prioritaires sur les catégories internes). */
  statDefs?: StatDef[];
  /** Division du joueur (Elite, Challenger…), affichée sous le drapeau. */
  division?: string | null;
  skin?: CardSkin;
  imageUrl?: string | null;
  /** PNG silhouette affiché quand le joueur n'a pas encore d'avatar. */
  fallbackImageUrl?: string | null;
  country?: string;
  className?: string;
  /** Styles inline (ex. surcharge des variables --pc-* pour l'éditeur de skins). */
  style?: CSSProperties;
  /** Force les effets premium (halo + foil) — utile pour l'éditeur de skins. */
  animated?: boolean;
}

/**
 * Carte joueur FUT « Founders » (forme bouclier crénelée, un même template
 * pour tous les jeux) : plaque jeu sur le liseré, OVR + ville + drapeau +
 * division en colonne, portrait (ou fallback IA), nom + victoires, stats de
 * la catégorie du jeu (séparateur porté par les cellules), marque en pied.
 */
export function PlayerCard({
  username,
  rating,
  wins,
  city,
  gameSlug,
  gameName,
  stats,
  statDefs,
  division,
  skin = "signature",
  imageUrl,
  fallbackImageUrl = "/cards/player-fallback.png",
  country = "CM",
  className = "",
  style,
  animated = false,
}: PlayerCardProps) {
  const skinClass = skin === "gold" ? "" : `pcard--${skin}`;
  const premium = PREMIUM_SKINS.includes(skin) || animated;
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });

  return (
    <div
      className={`pcard ${skinClass} ${premium ? "pcard--animated" : ""} ${className}`}
      style={style}
    >
      {gameName ? <span className="pcard__crest">{gameName}</span> : null}
      <CardBadge
        ovr={rating}
        cityText={cityAbbr(city)}
        country={country}
        division={division}
      />
      <div className="pcard__img">
        <CardImage
          imageUrl={imageUrl}
          fallbackImageUrl={fallbackImageUrl}
          alt={username}
        />
      </div>

      <div className="pcard__identity">
        <div className="pcard__name">{username}</div>
        <div className="pcard__meta">{wins} VICT.</div>
      </div>

      <div className="pcard__stats">
        {rows.map((s) => (
          <div key={s.abbr} className="pcard__stat" title={s.label}>
            <b>{s.value}</b>
            <span>{s.abbr}</span>
          </div>
        ))}
      </div>

      <div className="pcard__footer">
        <span className="pcard__chip">ESPORT 237</span>
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
  /** Division globale (Elite, Challenger…) sous le drapeau. */
  division?: string | null;
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  country?: string;
  /** Défaut = global ; "champion" pour le n°1 du classement global. */
  skin?: "global" | "champion";
  className?: string;
}

/**
 * Carte globale (identité tous jeux) — même template/forme que la carte de
 * jeu, plaque « GLOBALE » (pas de badge jeu). OVR = MEILLEURE note ; les
 * stats du bas listent les jeux joués et leur note.
 */
export function GlobalCard({
  username,
  cards,
  points,
  wins,
  losses,
  platform,
  city,
  division,
  imageUrl,
  fallbackImageUrl = "/cards/player-fallback.png",
  country = "CM",
  skin = "global",
  className = "",
}: GlobalCardProps) {
  // OVERALL = MEILLEURE note (décision du porteur — pas la moyenne).
  const overall = cards.length ? Math.max(...cards.map((c) => c.rating)) : 0;
  const cells = cards.slice(0, 6);

  return (
    <div className={`pcard pcard--${skin} ${className}`}>
      <span className="pcard__crest">Globale</span>
      <CardBadge
        ovr={overall}
        tag="GLB"
        cityText={cityAbbr(city)}
        country={country}
        division={division}
      />
      <div className="pcard__img">
        <CardImage
          imageUrl={imageUrl}
          fallbackImageUrl={fallbackImageUrl}
          alt={username}
        />
      </div>

      <div className="pcard__identity">
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

      <div className="pcard__footer">
        <span className="pcard__chip">ESPORT 237</span>
      </div>
    </div>
  );
}
