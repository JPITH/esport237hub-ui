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
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { cardStats, cityAbbr, type StatDef } from '../lib/player-stats';
import { CARD_LAYOUT, FLAG_RADIUS, pct } from '../skins/geometry';
import { stopColor, type SkinSpec } from '../skins/spec';
import { useSkin } from '../skins/context';

import {
  CARD_FONTS,
  CardChrome,
  useCardScale,
  type CardSkinInput,
} from './card-skins';
import { DivisionBadge } from './division-badge';
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
        style={[s.division, { alignSelf: 'auto', borderColor: spec.frame[0] }]}
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
      <View style={[s.chip, { borderColor: stopColor(spec.frame, 1) }]}>
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
}

export function PlayerCard({ skin = 'signature', animated, ...props }: PlayerCardProps) {
  return (
    <CardChrome skin={skin} animated={animated}>
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
  divisionRank,
  divisionColor,
  imageUrl,
  skin = 'signature',
  country = 'CM',
}: PlayerCardProps) {
  const spec = useSkin(skin);
  const s = useCardStyles();
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });

  return (
    <>
      {gameName ? <CardCrest spec={spec} label={gameName} /> : null}

      <View style={s.badge}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[s.ovr, { color: spec.ink }]}>
          {rating}
        </Text>
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
 *
 * Les POSITIONS viennent de `CARD_LAYOUT` (socle partagé) et sont exprimées en
 * pourcentages, exactement comme les règles `.pcard__*` du web : c'est ce qui
 * garantit que l'OVR tombe au même endroit sur les trois plateformes. Seules
 * les TAILLES de texte restent propres au mobile (retour porteur du 24/07 :
 * « diminuer la taille des textes sur mobile »).
 *
 * Chivo/Space Grotesk encodent la graisse dans le nom de famille — ne jamais
 * cumuler avec `fontWeight` (conflit Android).
 */
function makeStyles(k: number) {
  const L = CARD_LAYOUT;
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
      lineHeight: 37 * k,
      letterSpacing: -2 * k,
    },
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

export type { CardStyles };
