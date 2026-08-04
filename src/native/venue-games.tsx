/**
 * Jeux disponibles dans une salle (natif) — jumelle de `./web/venue-games`,
 * mêmes noms, mêmes props.
 *
 * Deux libertés se croisent et le joueur doit les distinguer d'un coup d'œil :
 * la salle liste ce qu'elle a sous la main, la plateforme décide seule où le
 * classement s'applique. Un lieu peut proposer Tekken 8 sans qu'aucun duel n'y
 * soit possible — le dire franchement vaut mieux que de masquer la ligne.
 */
import { Gamepad2 } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { font, pill, radius, spacing, useE237Colors, withAlpha } from './core';

/** Un jeu de l'inventaire d'une salle — forme rendue par `GET /venues/:id`. */
export interface VenueGameItem {
  id: string;
  slug: string;
  name: string;
  /** Vrai si la plateforme ouvre les duels classés sur cette discipline. */
  duels_open: boolean;
}

export interface VenueGameListProps {
  items?: readonly VenueGameItem[] | null;
  /** Rendu quand la salle n'a rien déclaré (défaut : rien). */
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function VenueGameList({ items, emptyLabel, style }: VenueGameListProps) {
  const c = useE237Colors();

  if (!items || items.length === 0) {
    return emptyLabel ? (
      <Text style={[styles.empty, { color: c.textMuted }]}>{emptyLabel}</Text>
    ) : null;
  }

  return (
    <View style={[styles.list, style]}>
      {items.map((game, index) => (
        <View
          key={game.id}
          style={[
            styles.row,
            index > 0 && { borderTopWidth: 1, borderTopColor: c.border },
          ]}
        >
          <View style={styles.name}>
            <Gamepad2 color={c.textMuted} size={16} strokeWidth={1.75} />
            <Text
              style={[styles.label, { color: c.textPrimary }]}
              numberOfLines={1}
            >
              {game.name}
            </Text>
          </View>
          <View
            style={[
              styles.tag,
              game.duels_open
                ? { backgroundColor: withAlpha(c.accent, pill.fill.dark) }
                : { backgroundColor: c.surfaceRaised },
            ]}
          >
            <Text
              style={[
                styles.tagLabel,
                { color: game.duels_open ? c.accent : c.textMuted },
              ]}
            >
              {game.duels_open ? 'Duels ouverts' : 'Sur place'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing['3'],
    paddingVertical: spacing['2'],
  },
  name: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  label: { flex: 1, fontSize: font.size.sm },
  tag: {
    borderRadius: radius.full,
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
  },
  tagLabel: { fontSize: font.size.xs, fontWeight: font.weight.semibold },
  empty: { fontSize: font.size.xs },
});
