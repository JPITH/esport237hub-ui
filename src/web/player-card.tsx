import type { CSSProperties } from "react";
import { UserRound } from "lucide-react";

import { cardStats, cityAbbr, type StatDef } from "../lib/player-stats";
import { DivisionBadge } from "./division-badge";
import {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  type BuiltinSkinKey,
} from "../skins/spec";
import { CardChrome, type CardSkinInput } from "./card-chrome";
import { Flag } from "./flag";

/**
 * Clé de skin : les skins intégrés sont autocomplétés, mais toute chaîne est
 * acceptée — un skin créé dans le dashboard est une clé arbitraire, résolue
 * par le catalogue (`SkinCatalogProvider`).
 */
export type CardSkin = BuiltinSkinKey | (string & {});

/**
 * Skins PREMIUM vendables (fond exclusif + foil et halo animés) — DÉRIVÉS du
 * socle partagé, plus recopiés à la main de part et d'autre.
 */
export const PREMIUM_SKINS: BuiltinSkinKey[] = BUILTIN_SKIN_KEYS.filter(
  (k) => BUILTIN_SKINS[k].premium,
);

/** Libellés des skins intégrés — une seule table, celle du socle. */
export const SKIN_LABELS: Record<BuiltinSkinKey, string> = Object.fromEntries(
  BUILTIN_SKIN_KEYS.map((k) => [k, BUILTIN_SKINS[k].label]),
) as Record<BuiltinSkinKey, string>;

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

/**
 * Colonne badge : OVR + abrégé ville + drapeau + division.
 * La division s'affiche en RANG (« DIV 3 ») via `DivisionBadge` ; son nom
 * (« Challenger ») reste dans l'`aria-label`. Sans rang connu on retombe sur
 * l'ancien libellé texte — même cadre, mêmes dimensions dans les deux cas.
 */
function CardBadge({
  ovr,
  tag,
  cityText,
  country,
  division,
  divisionRank,
  divisionColor,
}: {
  ovr: number;
  tag?: string;
  cityText: string;
  country: string;
  division?: string | null;
  divisionRank?: number | null;
  divisionColor?: string | null;
}) {
  return (
    <div className="pcard__badge">
      <span className="pcard__ovr">{ovr}</span>
      {tag ? <span className="pcard__ovrlabel">{tag}</span> : null}
      <span className="pcard__pos">{cityText}</span>
      <span className="pcard__flag">
        <Flag country={country} />
      </span>
      {divisionRank != null ? (
        <DivisionBadge
          className="pcard__division"
          rank={divisionRank}
          name={division ?? undefined}
          color={divisionColor}
        />
      ) : division ? (
        <span className="pcard__division">{division}</span>
      ) : null}
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
  /** Nom de la division (Élite, Challenger…) — sert d'`aria-label` et de repli. */
  division?: string | null;
  /** Rang de la division : affiche « DIV 3 » sous le drapeau. */
  divisionRank?: number | null;
  /** Couleur de la division fournie par le back-office (hex). */
  divisionColor?: string | null;
  /** Clé de skin (intégrée ou boutique) ou `SkinSpec` complet. */
  skin?: CardSkinInput;
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
  divisionRank,
  divisionColor,
  skin = "signature",
  imageUrl,
  fallbackImageUrl = "/cards/player-fallback.png",
  country = "CM",
  className = "",
  style,
  animated = false,
}: PlayerCardProps) {
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });

  return (
    <CardChrome skin={skin} animated={animated} className={className} style={style}>
      {gameName ? <span className="pcard__crest">{gameName}</span> : null}
      <CardBadge
        ovr={rating}
        cityText={cityAbbr(city)}
        country={country}
        division={division}
        divisionRank={divisionRank}
        divisionColor={divisionColor}
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
    </CardChrome>
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
  /** Nom de la division globale — sert d'`aria-label` et de repli. */
  division?: string | null;
  /** Rang de la division globale : affiche « DIV 3 » sous le drapeau. */
  divisionRank?: number | null;
  /** Couleur de la division fournie par le back-office (hex). */
  divisionColor?: string | null;
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  country?: string;
  /** Défaut = global ; "champion" pour le n°1 du classement global. */
  skin?: CardSkinInput;
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
  divisionRank,
  divisionColor,
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
    <CardChrome skin={skin} className={className}>
      <span className="pcard__crest">Globale</span>
      <CardBadge
        ovr={overall}
        tag="GLB"
        cityText={cityAbbr(city)}
        country={country}
        division={division}
        divisionRank={divisionRank}
        divisionColor={divisionColor}
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
    </CardChrome>
  );
}
