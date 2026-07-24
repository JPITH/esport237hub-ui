/**
 * Carte de jeu FUT « Founders » — une par discipline pratiquée par le joueur.
 * MÊME design que le web (`.pcard` de components.css) : bouclier crénelé,
 * plaque jeu posée sur le liseré, colonne badge (OVR / ville / drapeau /
 * division), photo du joueur ou silhouette IA de repli, nom + victoires
 * (sans bordure basse), stats en deux colonnes dont le séparateur est porté
 * par les cellules, marque en pied.
 *
 * Tailles pilotées par l'échelle de CardChrome (équivalent natif des `cqw`
 * du web) ; police Inter (chargée par l'app via @expo-google-fonts/inter).
 */
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { cardStats, cityAbbr, type StatDef } from '../lib/player-stats';

import {
  CARD_FONTS,
  CARD_SKINS,
  CardChrome,
  useCardScale,
  type CardSkin,
  type SkinSpec,
} from './card-skins';
import { Flag } from './flag';

/** Silhouette IA de repli (PNG léger bundlé — 28 Ko). */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FALLBACK_AVATAR = require('./assets/player-fallback.png');

/** Styles de carte proportionnels à la largeur mesurée (k = largeur/300). */
export function useCardStyles() {
  const k = useCardScale();
  return useMemo(() => makeStyles(k), [k]);
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
          { borderColor: spec.frame[0], backgroundColor: spec.linear[2] },
        ]}>
        <Text numberOfLines={1} style={[s.crestText, { color: spec.ink }]}>
          {label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

/** Chip division (Elite, Challenger…) sous le drapeau. */
export function DivisionChip({ spec, label }: { spec: SkinSpec; label: string }) {
  const s = useCardStyles();
  return (
    <View style={[s.division, { borderColor: spec.frame[0] }]}>
      <Text numberOfLines={1} style={[s.divisionText, { color: spec.ink }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

/** Photo du joueur ou silhouette IA de repli. */
export function CardPortrait({ imageUrl }: { imageUrl?: string | null }) {
  const s = useCardStyles();
  return (
    <View style={s.img}>
      <Image
        source={imageUrl ? { uri: imageUrl } : FALLBACK_AVATAR}
        style={s.portrait}
        resizeMode="contain"
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
      <View style={[s.chip, { borderColor: spec.frame[1] }]}>
        <Text style={[s.chipText, { color: spec.ink }]}>ESPORT 237</Text>
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
  /** Division du joueur (Elite, Challenger…), affichée sous le drapeau. */
  division?: string | null;
  /** Photo détourée du joueur ; silhouette IA de repli sinon. */
  imageUrl?: string | null;
  skin?: CardSkin;
  country?: string;
}

export function PlayerCard({ skin = 'signature', ...props }: PlayerCardProps) {
  return (
    <CardChrome skin={skin}>
      <PlayerCardBody skin={skin} {...props} />
    </CardChrome>
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
  imageUrl,
  skin = 'signature',
  country = 'CM',
}: PlayerCardProps) {
  const spec = CARD_SKINS[skin];
  const s = useCardStyles();
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });

  return (
    <>
      {gameName ? <CardCrest spec={spec} label={gameName} /> : null}

      <View style={s.head}>
        <View style={s.badge}>
          <Text style={[s.ovr, { color: spec.ink }]}>{rating}</Text>
          <Text style={[s.pos, { color: spec.ink }]}>{cityAbbr(city)}</Text>
          <View style={s.flag}>
            <Flag country={country} />
          </View>
          {division ? <DivisionChip spec={spec} label={division} /> : null}
        </View>
        <CardPortrait imageUrl={imageUrl} />
      </View>

      <View style={[s.identity, { borderTopColor: spec.line }]}>
        <Text numberOfLines={1} style={[s.name, { color: spec.ink }]}>
          {username.toUpperCase()}
        </Text>
        <Text numberOfLines={1} style={[s.record, { color: spec.ink }]}>
          {wins} VICT.
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
 * Inter encode la graisse dans le nom de famille — pas de fontWeight cumulé.
 */
function makeStyles(k: number) {
  return StyleSheet.create({
    crestWrap: {
      position: 'absolute',
      top: '1%',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    crest: {
      maxWidth: '60%',
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: 4 * k,
      paddingHorizontal: 12 * k,
    },
    crestText: { fontFamily: CARD_FONTS.extraBold, fontSize: 9 * k, letterSpacing: 1.2 * k },
    head: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8 * k },
    badge: { alignItems: 'center', gap: 2 * k, paddingTop: 2 * k, minWidth: 52 * k, maxWidth: '26%' },
    ovr: {
      fontFamily: CARD_FONTS.black,
      fontSize: 34 * k,
      lineHeight: 32 * k,
      letterSpacing: -1.4 * k,
    },
    pos: {
      marginTop: 3 * k,
      fontFamily: CARD_FONTS.extraBold,
      fontSize: 13 * k,
      letterSpacing: 1 * k,
    },
    flag: {
      width: 27 * k,
      height: 18 * k,
      marginTop: 6 * k,
      borderRadius: 2,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(255,255,255,0.45)',
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
    divisionText: { fontFamily: CARD_FONTS.extraBold, fontSize: 7 * k, letterSpacing: 0.8 * k },
    img: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
    portrait: { width: '96%', height: '96%' },
    /* Bandeau identité — bordure haute seulement (pas de bordure basse). */
    identity: {
      alignItems: 'center',
      alignSelf: 'center',
      width: '86%',
      marginTop: 4 * k,
      paddingTop: 7 * k,
      paddingBottom: 2 * k,
      borderTopWidth: 1,
    },
    name: {
      fontFamily: CARD_FONTS.black,
      fontSize: 19 * k,
      letterSpacing: 0.8 * k,
      textTransform: 'uppercase',
    },
    record: {
      marginTop: 3 * k,
      fontFamily: CARD_FONTS.bold,
      fontSize: 10 * k,
      letterSpacing: 0.8 * k,
      opacity: 0.75,
    },
    stats: {
      alignSelf: 'center',
      width: '82%',
      marginTop: 8 * k,
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 5 * k,
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
      fontSize: 15 * k,
      fontVariant: ['tabular-nums'],
    },
    statAbbr: {
      fontFamily: CARD_FONTS.extraBold,
      fontSize: 10 * k,
      letterSpacing: 0.5 * k,
      opacity: 0.72,
    },
    footer: { position: 'absolute', left: 0, right: 0, bottom: '7%', alignItems: 'center' },
    chip: {
      borderWidth: 1,
      borderRadius: 3,
      paddingVertical: 3 * k,
      paddingHorizontal: 9 * k,
      backgroundColor: 'rgba(0,0,0,0.22)',
    },
    chipText: { fontFamily: CARD_FONTS.extraBold, fontSize: 7 * k, letterSpacing: 0.9 * k },
  });
}

export type { CardStyles };
