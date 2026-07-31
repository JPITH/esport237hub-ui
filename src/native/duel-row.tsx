/**
 * Ligne de liste d'un duel : adversaires, contexte, score et statut.
 * La navigation reste hors DS (`onPress` fourni par l'écran).
 */
import { Pressable, StyleSheet, View } from 'react-native';

import type { DuelStatus } from '@esport237hub/types';

import { Card, radius, spacing } from './core';
import { DuelStatusBadge } from './duel-status-badge';
import { Txt } from './text';

export interface DuelRowData {
  id: string;
  status: DuelStatus;
  is_online: boolean;
  challenger_score: number | null;
  opponent_score: number | null;
  scheduled_at?: string | null;
  created_at: string;
  challenger?: { username?: string | null } | null;
  opponent?: { username?: string | null } | null;
  game?: { name?: string | null } | null;
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function DuelRow({
  duel,
  onPress,
}: {
  duel: DuelRowData;
  onPress: () => void;
}) {
  const hasScore = duel.challenger_score !== null && duel.opponent_score !== null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
      <Card style={styles.row}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="label" numberOfLines={1}>
            {duel.challenger?.username ?? '?'} vs{' '}
            {duel.opponent?.username ?? 'adversaire ouvert'}
          </Txt>
          <Txt variant="caption" tone="muted">
            {duel.game?.name ?? '—'} · {duel.is_online ? 'En ligne' : 'En salle'} ·{' '}
            {formatWhen(duel.scheduled_at ?? duel.created_at)}
          </Txt>
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing['1'] }}>
          {hasScore ? (
            <Txt variant="numeric" size={16}>
              {duel.challenger_score}–{duel.opponent_score}
            </Txt>
          ) : null}
          <DuelStatusBadge status={duel.status} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderRadius: radius.lg,
  },
});
