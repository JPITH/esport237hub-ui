/**
 * Carte de jeu façon FUT — une par discipline pratiquée par le joueur.
 * MÊME design que le web (`.pcard` de globals.css) : ratio 63/88, colonne
 * badge (OVR / ville / drapeau), silhouette, gros chiffre victoires en
 * accent, pseudo, jeu, stats en deux colonnes. Les palettes viennent de
 * `card-skins.tsx` (partagées avec le web) ; UNE seule surface, aucun bloc
 * encadré à l'intérieur (demande du porteur).
 */
import { UserRound } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { cardStats, cityAbbr } from '../lib/player-stats';

import { CARD_SKINS, CardChrome, type CardSkin } from './card-skins';
import { Flag } from './flag';

export function PlayerCard({
  username,
  rating,
  wins,
  city,
  gameSlug,
  gameName,
  stats,
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
  skin?: CardSkin;
  country?: string;
}) {
  const spec = CARD_SKINS[skin];
  const rows = cardStats({ gameSlug, rating, stats, seed: username });

  return (
    <CardChrome skin={skin}>
      <View style={s.head}>
        <View style={s.badge}>
          <Text style={[s.ovr, { color: spec.ink }]}>{rating}</Text>
          <Text style={[s.ovrLabel, { color: spec.ink }]}>OVR</Text>
          <Text style={[s.pos, { color: spec.ink }]}>{cityAbbr(city)}</Text>
          <View style={[s.rule, { backgroundColor: spec.ink }]} />
          <Flag country={country} />
        </View>
        <View style={s.img}>
          <UserRound size={96} color={spec.ink} strokeWidth={1.25} style={{ opacity: 0.2 }} />
        </View>
      </View>

      <View style={s.nameWrap}>
        <View style={s.winsRow}>
          <Text
            style={[
              s.wins,
              {
                color: spec.accent,
                textShadowColor: `${spec.accent}55`,
                textShadowRadius: 12,
                textShadowOffset: { width: 0, height: 4 },
              },
            ]}>
            {wins}
          </Text>
          <Text style={[s.winsLbl, { color: spec.ink }]}>VICT.</Text>
        </View>
        <Text numberOfLines={1} style={[s.name, { color: spec.ink }]}>
          {username.toUpperCase()}
        </Text>
        {gameName ? (
          <Text numberOfLines={1} style={[s.meta, { color: spec.ink }]}>
            {gameName}
          </Text>
        ) : null}
      </View>

      <View style={[s.stats, { borderTopColor: spec.line }]}>
        {rows.map((row) => (
          <View key={row.abbr} style={s.stat}>
            <Text style={[s.statValue, { color: spec.ink }]}>{row.value}</Text>
            <Text style={[s.statAbbr, { color: spec.ink }]}>{row.abbr}</Text>
          </View>
        ))}
      </View>
    </CardChrome>
  );
}

export const s = StyleSheet.create({
  head: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  badge: { alignItems: 'center', gap: 2, paddingTop: 2, minWidth: 46 },
  ovr: { fontSize: 34, fontWeight: '700', lineHeight: 32, letterSpacing: -1 },
  ovrLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, opacity: 0.75 },
  pos: { marginTop: 3, fontSize: 13, fontWeight: '700', letterSpacing: 0.8 },
  rule: { width: 26, height: 1, opacity: 0.4, marginVertical: 3 },
  img: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  nameWrap: { alignItems: 'center', marginTop: 2 },
  winsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 2 },
  wins: { fontSize: 40, fontWeight: '700', lineHeight: 36, letterSpacing: -1.6 },
  winsLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, opacity: 0.7, marginTop: 2 },
  name: {
    marginTop: -8,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  meta: { fontSize: 11, opacity: 0.72 },
  stats: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 18,
    rowGap: 4,
    justifyContent: 'center',
  },
  stat: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  statValue: { fontSize: 15, fontWeight: '700', minWidth: 22, fontVariant: ['tabular-nums'] },
  statAbbr: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, opacity: 0.72 },
});
