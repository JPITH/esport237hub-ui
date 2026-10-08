/*
 * `"use client"` : le repli d'image tient un état (l'URL qui a échoué).
 * `CardChrome`, rendu juste en dessous, est déjà une frontière client — la
 * directive ne déplace donc aucune frontière, elle la nomme.
 */
"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon } from "../icons/generated/web";

import { useDsT } from "../i18n";
import { cardRecord } from "../lib/game-cards";
import { cardStats, cityAbbr, type StatDef } from "../lib/player-stats";
import { DivisionBadge } from "./division-badge";
import {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  type BuiltinSkinKey,
} from "../skins/spec";
import { cardShape, pct } from "../skins/geometry";
import { useSkin } from "../skins/context";
import { CardChrome, type CardSkinInput } from "./card-chrome";
import { CardStage, RisingNumber } from "./card-stage";
import { Flag } from "./flag";
import { Picture } from './picture';

/**
 * Clé de skin : les skins intégrés sont autocomplétés, mais toute chaîne est
 * acceptée — un skin créé dans le dashboard est une clé arbitraire, résolue
 * par le catalogue (`SkinCatalogProvider`).
 */
import { BRAND_NAME } from '../lib/brand-name';

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
 *
 * Une photo qui ne CHARGE pas redescend la même échelle : d'abord la
 * silhouette de l'app, puis l'icône. Sans cela, un média retiré ou un 403 sur
 * un média redevenu privé laissait l'icône « image cassée » du navigateur au
 * milieu de la carte — exactement là où l'œil cherche le joueur.
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
  // L'URL en échec, pas un booléen : changer de photo doit retenter le
  // chargement sans effet de synchronisation.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = imageUrl && failedSrc !== imageUrl ? imageUrl : null;
  const fallback =
    fallbackImageUrl && failedSrc !== fallbackImageUrl ? fallbackImageUrl : null;
  const src = photo ?? fallback;
  if (src) {
    /*
     * Décliné en AVIF / WebP quand le fichier est local (`Picture` s'en charge
     * et laisse passer les URL distantes telles quelles).
     *
     * L'enjeu est concret : le repli affiché derrière CHAQUE carte joueur sans
     * photo pesait 1817 Ko en PNG, contre 53 Ko en AVIF. Sur un rail de six
     * cartes, c'était 11 Mo au lieu de 320 Ko.
     */
    return (
      <Picture
        className="pcard__photo"
        src={src}
        alt={photo ? alt : ""}
        width={180}
        height={150}
        onError={() => setFailedSrc(src)}
      />
    );
  }
  return (
    <span className="pcard__imgph" aria-hidden>
      <Icon name="user" strokeWidth={1.25} />
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
  cityText,
  country,
  division,
  divisionRank,
  divisionColor,
}: {
  ovr: number;
  cityText: string;
  country: string;
  division?: string | null;
  divisionRank?: number | null;
  divisionColor?: string | null;
}) {
  return (
    <div className="pcard__badge">
      {/* La note monte en compteur quand elle augmente (duel validé). */}
      <RisingNumber value={ovr} className="pcard__ovr" />
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
  /** Défaites dans ce jeu — verso : duels joués et taux de réussite. */
  losses?: number | null;
  /** Points de carrière dans ce jeu — verso. */
  points?: number | null;
  /**
   * Inclinaison 3D qui suit la souris (ou le doigt) et reflet holographique.
   * Désactivé par défaut : une carte dans une grille ou un carrousel garde
   * son comportement.
   */
  interactive?: boolean;
  /** Retournement recto/verso au clic (Entrée / Espace au clavier). */
  flippable?: boolean;
  /** Verso personnalisé ; par défaut les stats détaillées du jeu. */
  back?: ReactNode;
}

/**
 * Carte joueur FUT « Founders » (forme bouclier crénelée, un même template
 * pour tous les jeux) : plaque jeu sur le liseré, OVR + ville + drapeau +
 * division en colonne, portrait (ou fallback IA), nom + victoires, stats de
 * la catégorie du jeu (séparateur porté par les cellules), marque en pied.
 *
 * Sans `interactive` ni `flippable`, le DOM est exactement celui d'avant (un
 * seul `.pcard`) : l'API reste rétrocompatible. Avec l'un des deux, la carte
 * est posée dans une scène (`CardStage`) — `className` va alors à la scène.
 */
export function PlayerCard({
  interactive = false,
  flippable = false,
  back,
  className = "",
  ...props
}: PlayerCardProps) {
  const t = useDsT();
  const spec = useSkin(props.skin ?? "signature");

  if (!interactive && !flippable) {
    return <PlayerCardFront {...props} className={className} />;
  }

  const verso = flippable
    ? (back ?? <PlayerCardBack {...props} />)
    : undefined;

  return (
    <CardStage
      spec={spec}
      interactive={interactive}
      flippable={flippable}
      className={className}
      front={<PlayerCardFront {...props} />}
      back={verso}
      flipLabel={`${t("ui.card.flip", {
        game: props.gameName ?? "",
        player: props.username,
      })}. ${t("ui.card.flipHint")}`}
    />
  );
}

/** Recto — la carte telle qu'elle a toujours été rendue. */
function PlayerCardFront({
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
}: Omit<PlayerCardProps, "interactive" | "flippable" | "back">) {
  const t = useDsT();
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
        <div className="pcard__meta">
          {wins} {t('ui.card.wins')}
        </div>
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
        <span className="pcard__chip">{BRAND_NAME}</span>
      </div>
    </CardChrome>
  );
}

/** Plafond des jauges du verso : une note de carte s'arrête à 99. */
const STAT_MAX = 99;

/** Position d'un bloc du verso, depuis le gabarit partagé avec le natif. */
function backBox(box: {
  top: number;
  left: number;
  width: number;
  height?: number;
}): CSSProperties {
  return {
    top: pct(box.top),
    left: pct(box.left),
    width: pct(box.width),
    ...(box.height != null ? { height: pct(box.height) } : null),
  };
}

/**
 * Verso — les stats détaillées du jeu, sur la même forme et le même skin
 * que le recto. Exporté pour les aperçus (éditeur de skins, planches) ; une
 * carte `flippable` le monte d'elle-même au premier retournement. Ne lit que les données déjà chargées : les six axes
 * (`cardStats`, mêmes valeurs qu'au recto) et le bilan (`cardRecord`). Sans
 * défaites connues, pas de taux de réussite inventé.
 */
export function PlayerCardBack({
  username,
  rating,
  wins,
  losses,
  points,
  gameSlug,
  gameName,
  stats,
  statDefs,
  skin = "signature",
}: Omit<PlayerCardProps, "interactive" | "flippable" | "back">) {
  const t = useDsT();
  /* Le verso suit la forme du skin : son gabarit est replacé dans la zone
     sûre de la silhouette, comme celui du recto (variables `--pc-l-*`). */
  const back = cardShape(useSkin(skin).shape).backLayout;
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });
  const record = cardRecord(wins, losses);
  const cells =
    losses != null
      ? [
          { value: String(record.played), label: t("ui.card.back.played") },
          { value: String(record.wins), label: t("ui.card.back.won") },
          { value: String(record.losses), label: t("ui.card.back.lost") },
          {
            value: record.winRate == null ? "—" : `${record.winRate} %`,
            label: t("ui.card.back.winRate"),
          },
        ]
      : [{ value: String(record.wins), label: t("ui.card.back.won") }];

  return (
    <CardChrome skin={skin} className="pcard--back">
      {gameName ? <span className="pcard__crest">{gameName}</span> : null}

      <div className="pcard__back-title" style={backBox(back.title)}>
        <span>{t("ui.card.back.title")}</span>
        {points != null ? <b>{t("ui.card.back.points", { n: points })}</b> : null}
      </div>

      <ul className="pcard__back-stats" style={backBox(back.stats)}>
        {rows.map((row) => (
          <li key={row.abbr} className="pcard__back-row">
            <span className="pcard__back-label">{row.label}</span>
            <b className="pcard__back-value">{row.value}</b>
            <span className="pcard__back-bar" aria-hidden>
              <i style={{ width: pct(Math.min(1, Math.max(0, row.value / STAT_MAX))) }} />
            </span>
          </li>
        ))}
      </ul>

      <dl className="pcard__back-record" style={backBox(back.record)}>
        {cells.map((cell) => (
          /* `dt` d'abord (ordre sémantique), la valeur passe au-dessus en CSS. */
          <div key={cell.label} className="pcard__back-cell">
            <dt>{cell.label}</dt>
            <dd>{cell.value}</dd>
          </div>
        ))}
      </dl>

      <div className="pcard__footer">
        <span className="pcard__chip">{BRAND_NAME}</span>
      </div>
    </CardChrome>
  );
}
