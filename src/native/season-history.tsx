/**
 * Le PALMARÈS d'un joueur (natif) — jumeau de `../web/season-history`.
 *
 * Même exigence : **un joueur relégué doit comprendre pourquoi sans avoir à
 * demander.** D'où la position finale ET le nombre de duels sur chaque ligne —
 * c'est presque toujours le second qui explique le premier, un joueur sous le
 * plancher étant relégué avant ceux qui ont joué.
 *
 * Rien n'est recalculé : `finalPosition` et `finalOutcome` sont figés en base
 * à la clôture.
 */
import { Trophy } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  ROLLOVER_OUTCOME_LABEL,
  ROLLOVER_OUTCOME_TONE,
  divisionDisplayRank,
  seasonResultLabel,
  type DivisionView,
  type RolloverOutcome,
} from '../lib/ranking';
import { radius, spacing, useE237Colors } from './core';
import { DivisionBadge } from './division-badge';
import { Txt } from './text';

/** Une saison du palmarès — `GET /rankings/history/:username`. */
export interface SeasonHistoryEntry {
  seasonId: string;
  seasonName: string;
  startsAt: string;
  endsAt: string | null;
  state: string;
  game: { slug: string; name: string };
  division: (DivisionView & { id: string }) | null;
  points: number;
  wins: number;
  losses: number;
  duelsPlayed: number;
  finalPosition: number | null;
  finalOutcome: RolloverOutcome | null;
}

export interface SeasonHistoryProps {
  entries: readonly SeasonHistoryEntry[];
  /** Filtre d'affichage : ne montrer qu'une discipline. */
  gameSlug?: string;
  style?: StyleProp<ViewStyle>;
}

export function SeasonHistory({ entries, gameSlug, style }: SeasonHistoryProps) {
  const c = useE237Colors();
  const shown = gameSlug
    ? entries.filter((entry) => entry.game.slug === gameSlug)
    : entries;

  if (shown.length === 0) {
    return (
      // Le `style` reçu est un style de VUE : le poser sur un `Text` ne
      // compile pas (userSelect diverge entre ViewStyle et TextStyle).
      <View style={style}>
        <Txt variant="body" tone="secondary">
          Aucune saison jouée pour l’instant. Le premier duel validé ouvre ton
          palmarès.
        </Txt>
      </View>
    );
  }

  const toneColor = (tone: string) =>
    tone === 'success' ? c.success : tone === 'danger' ? c.danger : c.textSecondary;

  return (
    <View style={[styles.list, style]}>
      {shown.map((entry) => {
        const tone = entry.finalOutcome
          ? ROLLOVER_OUTCOME_TONE[entry.finalOutcome]
          : null;
        return (
          <View
            key={`${entry.seasonId}-${entry.game.slug}`}
            style={[styles.row, { borderBottomColor: c.border }]}>
            <View style={styles.main}>
              <Txt variant="label" numberOfLines={1}>
                {entry.seasonName}
              </Txt>
              <Txt variant="caption" tone="muted" numberOfLines={1}>
                {entry.game.name}
              </Txt>
              <View style={styles.metaRow}>
                <Txt variant="caption" tone="secondary">
                  {entry.duelsPlayed} duel{entry.duelsPlayed > 1 ? 's' : ''} ·{' '}
                  {entry.wins}/{entry.losses} · {entry.points} pts
                </Txt>
              </View>
            </View>

            <View style={styles.side}>
              {entry.division ? (
                <DivisionBadge
                  rank={divisionDisplayRank(entry.division)}
                  name={entry.division.name}
                  color={entry.division.color}
                />
              ) : null}
              <View style={styles.result}>
                <Trophy color={c.gold} size={13} />
                <Txt variant="bodyBold">
                  {seasonResultLabel(entry.state, entry.finalPosition)}
                </Txt>
              </View>
              {entry.finalOutcome && tone ? (
                <View style={[styles.outcome, { backgroundColor: c.surfaceRaised }]}>
                  <Txt variant="label" size={11} color={toneColor(tone)}>
                    {ROLLOVER_OUTCOME_LABEL[entry.finalOutcome]}
                  </Txt>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  main: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  side: { alignItems: 'flex-end', gap: spacing['1'] },
  result: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  outcome: { borderRadius: radius.full, paddingHorizontal: spacing['2'], paddingVertical: 2 },
});
