/**
 * Carte de jeu FUT « Founders » — une par discipline pratiquée par le joueur.
 * MÊME design que le web (`.pcard` de components.css) : bouclier crénelé,
 * plaque jeu posée sur le liseré, colonne badge (OVR / ville / drapeau /
 * division), photo du joueur ou silhouette IA de repli, nom + victoires
 * (sans bordure basse), stats en deux colonnes dont le séparateur est porté
 * par les cellules, marque en pied.
 *
 * Tailles pilotées par l'échelle de CardChrome (équivalent natif des `cqw`
 * du web) ; polices Space Grotesk / Chivo (comme le web).
 */
import { useMemo, useState, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BRAND_NAME } from '../lib/brand-name';
import { useDsT } from '../i18n';
import { cardRecord } from '../lib/game-cards';
import { cardStats, cityAbbr, type StatDef } from '../lib/player-stats';
import { FLAG_RADIUS, pct, type CardBackLayout, type CardLayout } from '../skins/geometry';
import { stopColor, type SkinSpec } from '../skins/spec';
import { useSkin } from '../skins/context';

import {
  CARD_FONTS,
  CardChrome,
  useCardScale,
  useCardShape,
  type CardSkinInput,
} from './card-skins';
import { CardStage, RisingNumber } from './card-motion';
import { DivisionBadge } from './division-badge';
import { Flag } from './flag';
import { Txt } from './text';

/** Silhouette IA de repli (PNG léger bundlé — 28 Ko). */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FALLBACK_AVATAR = require('./assets/player-fallback.png');

/** Styles de carte proportionnels à la largeur mesurée (k = largeur/300). */
export function useCardStyles() {
  const k = useCardScale();
  const layout = useCardShape().layout;
  return useMemo(() => makeStyles(k, layout), [k, layout]);
}

type CardStyles = ReturnType<typeof makeStyles>;

/** Plaque jeu (« FC 27 »…) ou « GLOBALE » — posée sur le haut du bouclier. */
export function CardCrest({ spec, label }: { spec: SkinSpec; label: string }) {
  const s = useCardStyles();
  return (
    <View style={s.crestWrap} pointerEvents="none">
      <View
        style={[
          s.crest,
          {
            borderColor: stopColor(spec.frame, 0),
            backgroundColor: stopColor(spec.surface, 2),
          },
        ]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[s.crestText, { color: spec.ink }]}>
          {label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

/**
 * Chip division sous le drapeau.
 *
 * Avec un rang connu on affiche « DIV 3 » via `DivisionBadge` (le nom de la
 * division reste dans `accessibilityLabel`) ; sinon on retombe sur l'ancien
 * libellé texte. Dans les deux cas le cadre garde EXACTEMENT les styles de la
 * carte (`s.division` / `s.divisionText`) : ni les dimensions ni l'encre du
 * skin ne bougent.
 */
export function DivisionChip({
  spec,
  rank,
  name,
  color,
}: {
  spec: SkinSpec;
  rank?: number | null;
  name?: string | null;
  color?: string | null;
}) {
  const s = useCardStyles();

  if (rank != null) {
    return (
      <DivisionBadge
        rank={rank}
        name={name ?? undefined}
        // `frame` est un SkinLinear (x1/y1/x2/y2 + stops), pas un tableau de
        // couleurs : `spec.frame[0]` rendait `undefined`, donc une bordure
        // sans couleur. Le premier arrêt du dégradé est la teinte haute.
        style={[
          s.division,
          { alignSelf: 'auto', borderColor: spec.frame.stops[0]?.color },
        ]}
        // Inter encode la graisse dans le nom de famille : pas de fontWeight cumulé.
        textStyle={[s.divisionText, { color: color ?? spec.ink, fontWeight: 'normal' }]}
      />
    );
  }

  if (!name) return null;

  return (
    <View style={[s.division, { borderColor: stopColor(spec.frame, 0) }]}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={[s.divisionText, { color: spec.ink }]}>
        {name.toUpperCase()}
      </Text>
    </View>
  );
}

/**
 * Photo du joueur ou silhouette IA de repli.
 *
 * Le repli couvre DEUX cas, pas un seul : pas d'URL du tout (le cas courant —
 * la plupart des joueurs n'ont pas de photo) **et** une URL qui ne charge pas.
 * Sans ce second repli, un média retiré ou un réseau coupé laissait un trou au
 * milieu de la carte, là où l'œil cherche le joueur.
 */
export function CardPortrait({ imageUrl }: { imageUrl?: string | null }) {
  const s = useCardStyles();
  // L'URL en échec, pas un booléen : changer de photo doit retenter le
  // chargement sans effet de synchronisation.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const usable = imageUrl && failedUrl !== imageUrl ? imageUrl : null;

  return (
    <View style={s.img}>
      <Image
        source={usable ? { uri: usable } : FALLBACK_AVATAR}
        style={s.portrait}
        resizeMode="contain"
        onError={() => setFailedUrl(imageUrl ?? null)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

/** Pied de carte : marque du hub. */
export function CardFooter({ spec }: { spec: SkinSpec }) {
  const s = useCardStyles();
  return (
    <View style={s.footer} pointerEvents="none">
      <View style={[s.chip, { borderColor: stopColor(spec.frame, 1) }]}>
        <Text style={[s.chipText, { color: spec.ink }]}>{BRAND_NAME}</Text>
      </View>
    </View>
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
  /** Nom de la division (Élite, Challenger…) — `accessibilityLabel` et repli. */
  division?: string | null;
  /** Rang de la division : affiche « DIV 3 » sous le drapeau. */
  divisionRank?: number | null;
  /** Couleur de la division fournie par le back-office (hex). */
  divisionColor?: string | null;
  /** Photo détourée du joueur ; silhouette IA de repli sinon. */
  imageUrl?: string | null;
  /** Clé de skin (intégrée ou boutique) ou `SkinSpec` complet. */
  skin?: CardSkinInput;
  country?: string;
  /** Force le foil même sur un skin non premium (aperçu de l'éditeur de skins). */
  animated?: boolean;
  /** Défaites dans ce jeu — verso : duels joués et taux de réussite. */
  losses?: number | null;
  /** Points de carrière dans ce jeu — verso. */
  points?: number | null;
  /**
   * Inclinaison 3D qui suit le doigt (la souris sur le web) et reflet
   * holographique. Désactivé par défaut : une carte dans un paquet glissable
   * ou une liste garde son comportement.
   */
  interactive?: boolean;
  /** Retournement recto/verso au toucher. */
  flippable?: boolean;
  /** Verso personnalisé ; par défaut les stats détaillées du jeu. */
  back?: ReactNode;
}

/**
 * Carte de jeu. Sans `interactive` ni `flippable`, c'est la carte statique
 * d'avant — l'API reste rétrocompatible. Quand la note (`rating`) augmente
 * d'un rendu à l'autre, elle monte en compteur avec un éclat du liseré.
 */
export function PlayerCard({
  skin = 'signature',
  animated,
  interactive = false,
  flippable = false,
  back,
  ...props
}: PlayerCardProps) {
  const t = useDsT();
  const spec = useSkin(skin);

  /* Progression de la note détectée au rendu (motif « ajuster l'état pendant
     le rendu ») : un incrément par hausse, jamais par image. */
  const [lastRating, setLastRating] = useState(props.rating);
  const [riseKey, setRiseKey] = useState(0);
  if (props.rating !== lastRating) {
    setLastRating(props.rating);
    if (props.rating > lastRating) setRiseKey((n) => n + 1);
  }

  const front = (
    <CardChrome skin={skin} animated={animated}>
      <PlayerCardBody skin={skin} {...props} />
    </CardChrome>
  );
  const verso = flippable
    ? (back ?? (
        <CardChrome skin={skin}>
          <PlayerCardBackBody skin={skin} {...props} />
        </CardChrome>
      ))
    : undefined;

  return (
    <CardStage
      spec={spec}
      interactive={interactive}
      flippable={flippable}
      front={front}
      back={verso}
      riseKey={riseKey}
      flipLabel={t('ui.card.flip', {
        game: props.gameName ?? '',
        player: props.username,
      })}
      flipHint={t('ui.card.flipHint')}
    />
  );
}

/** Corps de carte — rendu SOUS CardChrome pour recevoir l'échelle mesurée. */
function PlayerCardBody({
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
  imageUrl,
  skin = 'signature',
  country = 'CM',
}: Omit<PlayerCardProps, 'animated' | 'interactive' | 'flippable' | 'back'>) {
  const t = useDsT();
  const spec = useSkin(skin);
  const s = useCardStyles();
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });

  return (
    <>
      {gameName ? <CardCrest spec={spec} label={gameName} /> : null}

      <View style={s.badge}>
        {/* Hauteur de case = corps du chiffre ; le rattrapage négatif rend
            l'interligne serré d'origine (37 pour 40) au bloc suivant. */}
        <RisingNumber
          value={rating}
          textStyle={s.ovr}
          lineHeight={s.ovrBox.height}
          color={spec.ink}
          style={s.ovrBox}
        />
        <Text style={[s.pos, { color: spec.ink }]}>{cityAbbr(city)}</Text>
        <View style={s.flag}>
          <Flag country={country} />
        </View>
        <DivisionChip
          spec={spec}
          rank={divisionRank}
          name={division}
          color={divisionColor}
        />
      </View>
      <CardPortrait imageUrl={imageUrl} />

      <View style={[s.identity, { borderTopColor: spec.line }]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
          style={[s.name, { color: spec.ink }]}>
          {username.toUpperCase()}
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[s.record, { color: spec.ink }]}>
          {wins} {t('ui.card.wins')}
        </Text>
      </View>

      <View style={s.stats}>
        {rows.map((row, i) => (
          <View
            key={row.abbr}
            style={[
              s.stat,
              i % 2 === 0
                ? [s.statLeft, { borderRightColor: spec.line }]
                : s.statRight,
            ]}>
            <Text style={[s.statValue, { color: spec.ink }]}>{row.value}</Text>
            <Text style={[s.statAbbr, { color: spec.ink }]}>{row.abbr}</Text>
          </View>
        ))}
      </View>

      <CardFooter spec={spec} />
    </>
  );
}

/**
 * Fabrique des styles à l'échelle k (1 = carte de 300 px de large).
 *
 * Les POSITIONS viennent du gabarit de la forme (`CARD_LAYOUT` replacé dans
 * la zone sûre de la silhouette — identique pour le bouclier) et sont exprimées en
 * pourcentages, exactement comme les règles `.pcard__*` du web : c'est ce qui
 * garantit que l'OVR tombe au même endroit sur les trois plateformes. Seules
 * les TAILLES de texte restent propres au mobile (retour porteur du 24/07 :
 * « diminuer la taille des textes sur mobile »).
 *
 * Chivo/Space Grotesk encodent la graisse dans le nom de famille — ne jamais
 * cumuler avec `fontWeight` (conflit Android).
 */
function makeStyles(k: number, L: CardLayout) {
  return StyleSheet.create({
    crestWrap: {
      position: 'absolute',
      top: pct(L.crest.top),
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    crest: {
      maxWidth: pct(L.crest.maxWidth),
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: 4 * k,
      paddingHorizontal: 12 * k,
    },
    crestText: { fontFamily: CARD_FONTS.extraBold, fontSize: 9 * k, letterSpacing: 1.2 * k },
    badge: {
      position: 'absolute',
      top: pct(L.badge.top),
      left: pct(L.badge.left),
      width: pct(L.badge.width),
      alignItems: 'center',
      zIndex: 6,
    },
    /* Tailles volontairement PLUS PETITES que le web (retour porteur 24/07 :
       « diminuer la taille des textes sur mobile ») tout en gardant la
       hiérarchie FUT : OVR dominant, nom net, stats lisibles. */
    ovr: {
      fontFamily: CARD_FONTS.black,
      fontSize: 40 * k,
      letterSpacing: -2 * k,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
      includeFontPadding: false,
    },
    ovrBox: { height: 40 * k, marginBottom: -3 * k },
    pos: {
      marginTop: 3 * k,
      fontFamily: CARD_FONTS.extraBold,
      fontSize: 12 * k,
      letterSpacing: 1 * k,
    },
    /* Drapeau nu : ni liseré, ni ombre — seuls les coins sont arrondis.
       `overflow: hidden` est ce qui rogne effectivement le SVG. */
    flag: {
      width: pct(L.flag.width),
      aspectRatio: 3 / 2,
      marginTop: pct(L.flag.marginTop),
      borderRadius: FLAG_RADIUS * k,
      overflow: 'hidden',
    },
    division: {
      marginTop: 6 * k,
      maxWidth: '100%',
      borderWidth: 1,
      borderRadius: 4,
      paddingVertical: 2 * k,
      paddingHorizontal: 5 * k,
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    divisionText: { fontFamily: CARD_FONTS.extraBold, fontSize: 8 * k, letterSpacing: 0.8 * k },
    img: {
      position: 'absolute',
      top: pct(L.portrait.top),
      left: pct(L.portrait.left),
      width: pct(L.portrait.width),
      height: pct(L.portrait.height),
      alignItems: 'center',
      justifyContent: 'flex-end',
      zIndex: 4,
    },
    portrait: { width: '100%', height: '100%' },
    /* Bandeau identité — bordure haute seulement (pas de bordure basse). */
    identity: {
      position: 'absolute',
      top: pct(L.identity.top),
      left: pct(L.identity.left),
      width: pct(L.identity.width),
      alignItems: 'center',
      paddingTop: 7 * k,
      paddingBottom: 2 * k,
      borderTopWidth: 1,
      zIndex: 7,
    },
    /* Largeur bornée + centrage : indispensable pour qu'adjustsFontSizeToFit
       ait une boîte de référence — le texte rétrécit au lieu de déborder. */
    name: {
      width: '100%',
      textAlign: 'center',
      fontFamily: CARD_FONTS.black,
      fontSize: 17 * k,
      letterSpacing: 0.9 * k,
      textTransform: 'uppercase',
    },
    record: {
      maxWidth: '100%',
      textAlign: 'center',
      marginTop: 3 * k,
      fontFamily: CARD_FONTS.bold,
      fontSize: 9 * k,
      letterSpacing: 0.8 * k,
      opacity: 0.75,
    },
    stats: {
      position: 'absolute',
      top: pct(L.stats.top),
      left: pct(L.stats.left),
      width: pct(L.stats.width),
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 5 * k,
      zIndex: 7,
    },
    stat: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 6 * k,
    },
    statLeft: { borderRightWidth: 1, paddingRight: 12 * k },
    statRight: { paddingLeft: 12 * k },
    statValue: {
      fontFamily: CARD_FONTS.black,
      fontSize: 14 * k,
      fontVariant: ['tabular-nums'],
    },
    statAbbr: {
      fontFamily: CARD_FONTS.extraBold,
      fontSize: 9 * k,
      letterSpacing: 0.5 * k,
      opacity: 0.72,
    },
    footer: {
      position: 'absolute',
      bottom: pct(L.footer.bottom),
      left: pct(L.footer.left),
      width: pct(L.footer.width),
      alignItems: 'center',
      zIndex: 7,
    },
    chip: {
      borderWidth: 1,
      borderRadius: 3,
      paddingVertical: 3 * k,
      paddingHorizontal: 9 * k,
      backgroundColor: 'rgba(0,0,0,0.22)',
    },
    chipText: { fontFamily: CARD_FONTS.extraBold, fontSize: 8 * k, letterSpacing: 0.65 * k },
  });
}


/* ========================================================================== */
/* Verso — stats détaillées de la discipline                                  */
/* ========================================================================== */

/*
 * Même bouclier, même skin que le recto (le joueur retourne SA carte, pas une
 * fiche) : la plaque jeu reste en haut, la marque en pied. Entre les deux, les
 * six axes de la discipline en toutes lettres avec leur jauge, puis le bilan
 * (duels joués, victoires, défaites, réussite).
 *
 * Rien n'est chargé pour le verso : il ne lit que ce que l'écran a déjà —
 * `cardStats` pour les axes (mêmes valeurs qu'au recto), `cardRecord` pour le
 * bilan. Une donnée absente se tait (pas de défaites connues → pas de taux),
 * elle ne s'invente pas. Ses textes passent par `Txt`.
 */

/** Plafond des jauges : une note de carte s'arrête à 99. */
const STAT_MAX = 99;

export interface PlayerCardBackProps {
  username: string;
  rating: number;
  wins: number;
  losses?: number | null;
  points?: number | null;
  gameSlug?: string;
  gameName?: string;
  stats?: Record<string, number> | null;
  statDefs?: StatDef[];
  skin?: CardSkinInput;
}

/** Corps du verso — rendu SOUS `CardChrome` pour recevoir l'échelle mesurée. */
export function PlayerCardBackBody({
  username,
  rating,
  wins,
  losses,
  points,
  gameSlug,
  gameName,
  stats,
  statDefs,
  skin = 'signature',
}: PlayerCardBackProps) {
  const t = useDsT();
  const spec = useSkin(skin);
  const k = useCardScale();
  const backLayout = useCardShape().backLayout;
  const s = useMemo(() => makeBackStyles(k, backLayout), [k, backLayout]);
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });
  const record = cardRecord(wins, losses);
  const known = losses != null;

  const cells: { value: string; label: string }[] = known
    ? [
        { value: String(record.played), label: t('ui.card.back.played') },
        { value: String(record.wins), label: t('ui.card.back.won') },
        { value: String(record.losses), label: t('ui.card.back.lost') },
        {
          value: record.winRate == null ? '—' : `${record.winRate} %`,
          label: t('ui.card.back.winRate'),
        },
      ]
    : [{ value: String(record.wins), label: t('ui.card.back.won') }];

  return (
    <>
      {gameName ? <CardCrest spec={spec} label={gameName} /> : null}

      <View style={[s.title, { borderBottomColor: spec.line }]}>
        <Txt color={spec.ink} numberOfLines={1} style={s.titleText}>
          {t('ui.card.back.title').toUpperCase()}
        </Txt>
        {points != null ? (
          <Txt color={spec.ink} numberOfLines={1} style={s.titlePoints}>
            {t('ui.card.back.points', { n: points })}
          </Txt>
        ) : null}
      </View>

      <View style={s.stats}>
        {rows.map((row) => (
          <View key={row.abbr} style={s.row} accessible accessibilityLabel={`${row.label} ${row.value}`}>
            <View style={s.rowHead}>
              <Txt color={spec.ink} numberOfLines={1} style={s.rowLabel}>
                {row.label}
              </Txt>
              <Txt color={spec.ink} style={s.rowValue}>
                {row.value}
              </Txt>
            </View>
            <View style={[s.track, { backgroundColor: spec.line }]}>
              <View
                style={[
                  s.fill,
                  {
                    width: pct(Math.min(1, Math.max(0, row.value / STAT_MAX))),
                    backgroundColor: spec.accent,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={s.record}>
        {cells.map((cell) => (
          <View
            key={cell.label}
            style={[s.cell, { borderColor: spec.line }]}
            accessible
            accessibilityLabel={`${cell.label} ${cell.value}`}>
            <Txt color={spec.ink} numberOfLines={1} style={s.cellValue}>
              {cell.value}
            </Txt>
            <Txt color={spec.ink} numberOfLines={1} style={s.cellLabel}>
              {cell.label.toUpperCase()}
            </Txt>
          </View>
        ))}
      </View>

      <CardFooter spec={spec} />
    </>
  );
}

function makeBackStyles(k: number, L: CardBackLayout) {
  return StyleSheet.create({
    title: {
      position: 'absolute',
      top: pct(L.title.top),
      left: pct(L.title.left),
      width: pct(L.title.width),
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingBottom: 4 * k,
      borderBottomWidth: 1,
    },
    titleText: {
      fontFamily: CARD_FONTS.extraBold,
      fontSize: 10 * k,
      lineHeight: 13 * k,
      letterSpacing: 1.2 * k,
    },
    titlePoints: {
      fontFamily: CARD_FONTS.black,
      fontSize: 11 * k,
      lineHeight: 13 * k,
      fontVariant: ['tabular-nums'],
      opacity: 0.85,
    },
    stats: {
      position: 'absolute',
      top: pct(L.stats.top),
      left: pct(L.stats.left),
      width: pct(L.stats.width),
      height: pct(L.stats.height),
      justifyContent: 'space-between',
    },
    row: { gap: 3 * k },
    rowHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 6 * k,
    },
    rowLabel: {
      flexShrink: 1,
      fontFamily: CARD_FONTS.bold,
      fontSize: 10 * k,
      lineHeight: 13 * k,
      letterSpacing: 0.3 * k,
      opacity: 0.85,
    },
    rowValue: {
      fontFamily: CARD_FONTS.black,
      fontSize: 12 * k,
      lineHeight: 14 * k,
      fontVariant: ['tabular-nums'],
    },
    track: { height: 4 * k, borderRadius: 2 * k, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 2 * k },
    record: {
      position: 'absolute',
      top: pct(L.record.top),
      left: pct(L.record.left),
      width: pct(L.record.width),
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      rowGap: 5 * k,
    },
    cell: {
      width: '50%',
      alignItems: 'center',
      paddingVertical: 3 * k,
      borderTopWidth: 1,
    },
    cellValue: {
      fontFamily: CARD_FONTS.black,
      fontSize: 15 * k,
      lineHeight: 18 * k,
      fontVariant: ['tabular-nums'],
    },
    cellLabel: {
      fontFamily: CARD_FONTS.extraBold,
      fontSize: 7 * k,
      lineHeight: 9 * k,
      letterSpacing: 0.6 * k,
      opacity: 0.72,
    },
  });
}

export type { CardStyles };
