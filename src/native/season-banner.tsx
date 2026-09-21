/**
 * En-tête du classement saisonnier (natif) — jumeau de `../web/season-banner`.
 *
 * Mêmes trois informations, et pour la même raison : c'est le seul écran du
 * produit qui porte une ÉCHÉANCE. Un joueur qui découvre en fin de mois qu'il
 * n'était pas classé aura joué pour rien.
 */
import { CalendarClock, Info } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDsT, type DsKey } from '../i18n';
import {
  RANKING_SCOPE_HINT,
  duelsUntilRankedLabel,
  seasonProgress,
  seasonRemainingLabel,
} from '../lib/ranking';
import { Card, radius, spacing, useE237Colors } from './core';
import { Txt } from './text';

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

const STATE_LABEL_KEY: Record<string, DsKey> = {
  upcoming: 'ranking.season_state.upcoming',
  live: 'ranking.season_state.live',
  ended: 'ranking.season_state.ended',
  closed: 'ranking.season_state.closed',
};

export function SeasonBanner({
  season,
  duelsPlayed,
  minDuels,
  style,
}: SeasonBannerProps) {
  const c = useE237Colors();
  const t = useDsT();
  const progress = seasonProgress(season.startsAt, season.endsAt);
  const remaining =
    season.state === 'live' ? seasonRemainingLabel(season.endsAt) : null;
  const todo =
    duelsPlayed === null || duelsPlayed === undefined
      ? null
      : duelsUntilRankedLabel(duelsPlayed, minDuels);
  const stateKey = STATE_LABEL_KEY[season.state];

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.head}>
        <CalendarClock color={c.accent} size={16} />
        <Txt variant="label">{season.name}</Txt>
        <View style={[styles.state, { backgroundColor: c.surfaceRaised }]}>
          <Txt variant="label" size={11} tone="secondary">
            {stateKey ? t(stateKey) : season.state}
          </Txt>
        </View>
        {remaining ? (
          <Txt variant="caption" tone="secondary" style={styles.remaining}>
            {remaining}
          </Txt>
        ) : null}
      </View>

      {progress !== null ? (
        <View style={[styles.track, { backgroundColor: c.surfaceRaised }]}>
          <View
            style={[styles.fill, { backgroundColor: c.accent, width: `${progress * 100}%` }]}
          />
        </View>
      ) : null}

      <Txt variant="caption" tone="secondary">
        {RANKING_SCOPE_HINT.season}
      </Txt>

      {todo ? (
        <View style={[styles.todo, { backgroundColor: c.surfaceRaised }]}>
          <Info color={c.warning} size={14} />
          <Txt variant="caption" tone="warning" style={styles.todoText}>
            {todo}
          </Txt>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing['2'] },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  state: { borderRadius: radius.full, paddingHorizontal: spacing['2'], paddingVertical: 2 },
  remaining: { marginLeft: 'auto' },
  track: { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  todo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['1-5'],
    borderRadius: radius.md,
    padding: spacing['2'],
  },
  todoText: { flex: 1 },
});
