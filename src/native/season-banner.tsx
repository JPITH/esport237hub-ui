/**
 * En-tête du classement saisonnier (natif) — jumeau de `../web/season-banner`.
 *
 * Mêmes trois informations, et pour la même raison : c'est le seul écran du
 * produit qui porte une ÉCHÉANCE. Un joueur qui découvre en fin de mois qu'il
 * n'était pas classé aura joué pour rien.
 */
import { CalendarClock, Info } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  RANKING_SCOPE_HINT,
  duelsUntilRankedLabel,
  seasonProgress,
  seasonRemainingLabel,
} from '../lib/ranking';
import { Card, font, radius, spacing, useE237Colors } from './core';
import { Txt as Text } from './text';

/** Une saison telle que l'API la rend (`GET /rankings/seasons`). */
export interface SeasonView {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  closedAt: string | null;
  state: string;
}

export interface SeasonBannerProps {
  season: SeasonView;
  /** Duels comptabilisés par le joueur connecté ; absent = aucune échéance affichée. */
  duelsPlayed?: number | null;
  /** Plancher en vigueur — RÉGLABLE, il vient de `GET /rankings/rules`. */
  minDuels?: number;
  style?: StyleProp<ViewStyle>;
}

const STATE_LABEL: Record<string, string> = {
  upcoming: 'À venir',
  live: 'En cours',
  ended: 'Terminée',
  closed: 'Palmarès figé',
};

export function SeasonBanner({
  season,
  duelsPlayed,
  minDuels,
  style,
}: SeasonBannerProps) {
  const c = useE237Colors();
  const progress = seasonProgress(season.startsAt, season.endsAt);
  const remaining =
    season.state === 'live' ? seasonRemainingLabel(season.endsAt) : null;
  const todo =
    duelsPlayed === null || duelsPlayed === undefined
      ? null
      : duelsUntilRankedLabel(duelsPlayed, minDuels);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.head}>
        <CalendarClock color={c.accent} size={16} />
        <Text style={[styles.name, { color: c.textPrimary }]}>{season.name}</Text>
        <View style={[styles.state, { backgroundColor: c.surfaceRaised }]}>
          <Text style={[styles.stateText, { color: c.textSecondary }]}>
            {STATE_LABEL[season.state] ?? season.state}
          </Text>
        </View>
        {remaining ? (
          <Text style={[styles.remaining, { color: c.textSecondary }]}>{remaining}</Text>
        ) : null}
      </View>

      {progress !== null ? (
        <View style={[styles.track, { backgroundColor: c.surfaceRaised }]}>
          <View
            style={[styles.fill, { backgroundColor: c.accent, width: `${progress * 100}%` }]}
          />
        </View>
      ) : null}

      <Text style={[styles.hint, { color: c.textSecondary }]}>
        {RANKING_SCOPE_HINT.season}
      </Text>

      {todo ? (
        <View style={[styles.todo, { backgroundColor: c.surfaceRaised }]}>
          <Info color={c.warning} size={14} />
          <Text style={[styles.todoText, { color: c.warning }]}>{todo}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing['2'] },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  name: { fontSize: font.size.sm, fontWeight: font.weight.bold },
  state: { borderRadius: radius.full, paddingHorizontal: spacing['2'], paddingVertical: 2 },
  stateText: { fontSize: 11, fontWeight: font.weight.semibold },
  remaining: { marginLeft: 'auto', fontSize: font.size.xs },
  track: { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  hint: { fontSize: font.size.xs },
  todo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['1-5'],
    borderRadius: radius.md,
    padding: spacing['2'],
  },
  todoText: { flex: 1, fontSize: font.size.xs },
});
