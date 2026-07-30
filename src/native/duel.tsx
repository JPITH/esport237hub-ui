/**
 * Duels (natif) — jumeaux de `./web/duel`, mêmes noms, mêmes props
 * (la navigation passe par `onPress` au lieu de `href`).
 */
import type { DuelStatus } from '@esport237hub/types';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Badge, Card, font, radius, spacing, useE237Colors } from './core';
import { DuelStatusBadge } from './duel-status-badge';

/* ------------------------------------------------------------------ */
/* DuelRow                                                             */
/* ------------------------------------------------------------------ */

export interface DuelRowProps {
  /** Ouverture du détail ; absent = ligne non pressable. */
  onPress?: () => void;
  /** Pseudo du challenger ; `null` → « ? ». */
  challengerName?: string | null;
  /** Pseudo de l'adversaire ; `null` → « adversaire ouvert ». */
  opponentName?: string | null;
  gameName?: string | null;
  isOnline: boolean;
  /** Date déjà mise en forme (programmée, sinon création). */
  dateLabel: string;
  challengerScore: number | null;
  opponentScore: number | null;
  status: DuelStatus;
  style?: StyleProp<ViewStyle>;
}

/** Ligne de liste d'un duel : adversaires, contexte, score et statut. */
export function DuelRow({
  onPress,
  challengerName,
  opponentName,
  gameName,
  isOnline,
  dateLabel,
  challengerScore,
  opponentScore,
  status,
  style,
}: DuelRowProps) {
  const c = useE237Colors();
  const hasScore = challengerScore !== null && opponentScore !== null;

  const body = (
    <Card style={[styles.row, style]}>
      <View style={styles.main}>
        <Text style={[styles.names, { color: c.textPrimary }]}>
          {challengerName ?? '?'} vs {opponentName ?? 'adversaire ouvert'}
        </Text>
        <Text style={[styles.meta, { color: c.textMuted }]}>
          {gameName ?? '—'} · {isOnline ? 'En ligne' : 'En salle'} · {dateLabel}
        </Text>
      </View>
      <View style={styles.trailing}>
        {hasScore ? (
          <Text style={[styles.score, { color: c.textPrimary }]}>
            {challengerScore}–{opponentScore}
          </Text>
        ) : null}
        <DuelStatusBadge status={status} />
      </View>
    </Card>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {body}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* ScoreSide                                                           */
/* ------------------------------------------------------------------ */

export interface ScoreSideProps {
  /** Score ; `null` tant que le résultat n'est pas saisi (« – »). */
  score: number | null;
  /** Pseudo ; `null` → « En attente ». */
  username?: string | null;
  /** Nom civil sous le pseudo (facultatif). */
  name?: string | null;
  winner?: boolean;
  /** Ouverture de la fiche publique du joueur. */
  onPress?: () => void;
  /** Contenu additionnel sous le nom (avatar, drapeau…). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Un côté du tableau de score d'un duel : score, pseudo, nom, badge
 * « Vainqueur ».
 */
export function ScoreSide({
  score,
  username,
  name,
  winner = false,
  onPress,
  children,
  style,
}: ScoreSideProps) {
  const c = useE237Colors();
  const label = (
    <Text style={[styles.username, { color: c.textPrimary }]}>
      {username ?? 'En attente'}
    </Text>
  );

  return (
    <View style={[styles.side, style]}>
      <Text style={[styles.bigScore, { color: c.textPrimary }]}>
        {score ?? '–'}
      </Text>
      {onPress && username ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => (pressed ? styles.pressed : undefined)}
        >
          {label}
        </Pressable>
      ) : (
        label
      )}
      {name ? (
        <Text style={[styles.meta, { color: c.textMuted }]}>{name}</Text>
      ) : null}
      {winner ? <Badge tone="gold">Vainqueur</Badge> : null}
      {children}
    </View>
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
  main: { flex: 1, gap: 2 },
  names: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  meta: { fontSize: font.size.xs },
  trailing: { alignItems: 'flex-end', gap: spacing['1'] },
  score: { fontSize: 15, fontWeight: font.weight.bold },
  side: { alignItems: 'center', gap: spacing['1'] },
  bigScore: { fontSize: font.size['3xl'], fontWeight: font.weight.bold },
  username: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  pressed: { opacity: 0.85 },
});
