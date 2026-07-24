/**
 * Carte de jeu FUT « Founders » — une par discipline pratiquée par le joueur.
 * MÊME design que le web (`.pcard` de components.css) : bouclier crénelé,
 * plaque jeu posée sur le liseré, colonne badge (OVR / ville / drapeau /
 * division), silhouette, nom + victoires (sans bordure basse), stats en deux
 * colonnes dont le séparateur est porté par les cellules, marque en pied.
 * Les palettes viennent de `card-skins.tsx` (partagées avec le web).
 */
import { UserRound } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { cardStats, cityAbbr, type StatDef } from '../lib/player-stats';

import { CARD_SKINS, CardChrome, type CardSkin, type SkinSpec } from './card-skins';
import { Flag } from './flag';

/** Plaque jeu (« FC 27 »…) ou « GLOBALE » — posée sur le haut du bouclier. */
export function CardCrest({ spec, label }: { spec: SkinSpec; label: string }) {
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
  return (
    <View style={[s.division, { borderColor: spec.frame[0] }]}>
      <Text numberOfLines={1} style={[s.divisionText, { color: spec.ink }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

/** Pied de carte : marque du hub. */
export function CardFooter({ spec }: { spec: SkinSpec }) {
  return (
    <View style={s.footer} pointerEvents="none">
      <View style={[s.chip, { borderColor: spec.frame[1] }]}>
        <Text style={[s.chipText, { color: spec.ink }]}>ESPORT 237</Text>
      </View>
    </View>
  );
}

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
  skin = 'signature',
  country = 'CM',
}: {
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
  country?: string;
}) {
  const spec = CARD_SKINS[skin];
  const rows = cardStats({ gameSlug, rating, stats, seed: username, statDefs });

  return (
    <CardChrome skin={skin}>
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
        <View style={s.img}>
          <UserRound size={96} color={spec.ink} strokeWidth={1.25} style={{ opacity: 0.2 }} />
        </View>
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
                ? { borderRightWidth: 1, borderRightColor: spec.line, paddingRight: 12 }
                : { paddingLeft: 12 },
            ]}>
            <Text style={[s.statValue, { color: spec.ink }]}>{row.value}</Text>
            <Text style={[s.statAbbr, { color: spec.ink }]}>{row.abbr}</Text>
          </View>
        ))}
      </View>

      <CardFooter spec={spec} />
    </CardChrome>
  );
}

export const s = StyleSheet.create({
  /* Plaque jeu : posée sur le liseré haut (offsets absolus = bords carte). */
  crestWrap: { position: 'absolute', top: '1%', left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  crest: {
    maxWidth: '60%',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  crestText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  head: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  badge: { alignItems: 'center', gap: 2, paddingTop: 2, minWidth: 52, maxWidth: '26%' },
  ovr: { fontSize: 34, fontWeight: '900', lineHeight: 32, letterSpacing: -1.4 },
  pos: { marginTop: 3, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  flag: {
    width: 27,
    height: 18,
    marginTop: 6,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  division: {
    marginTop: 6,
    maxWidth: '100%',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  divisionText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  img: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  /* Bandeau identité — bordure haute seulement (pas de bordure basse). */
  identity: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '86%',
    marginTop: 4,
    paddingTop: 7,
    paddingBottom: 2,
    borderTopWidth: 1,
  },
  name: { fontSize: 19, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  record: { marginTop: 3, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, opacity: 0.75 },
  stats: {
    alignSelf: 'center',
    width: '82%',
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 5,
  },
  stat: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  statValue: { fontSize: 15, fontWeight: '900', fontVariant: ['tabular-nums'] },
  statAbbr: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, opacity: 0.72 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: '7%', alignItems: 'center' },
  chip: {
    borderWidth: 1,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  chipText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.9 },
});
