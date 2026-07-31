/**
 * Classement (natif) — jumeaux de `./web/ranking`, mêmes noms, mêmes props.
 *
 * `LiveBar` avait déjà exactement les mêmes quatre props et les mêmes
 * libellés des deux côtés ; seul `formatClock` divergeait (les secondes
 * manquaient au natif). Les libellés de mouvement viennent désormais tous de
 * `lib/ranking`.
 */
import { Crown, Radio, RefreshCw, WifiOff } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  LIVE_STATUS_LABEL,
  divisionMovementLabel,
  formatClock,
  rankMovementLabel,
  rankMovementPlaces,
  type LiveStatus,
  type RankMovement,
} from '../lib/ranking';
import { font, pill, radius, spacing, useE237Colors, withAlpha } from './core';
import { DivisionBadge } from './division-badge';
import { Skeleton, VerifiedMark } from './primitives';
import { TrendArrow } from './trend-arrow';

/* ------------------------------------------------------------------ */
/* LiveBar                                                             */
/* ------------------------------------------------------------------ */

export interface LiveBarProps {
  status: LiveStatus;
  refreshing: boolean;
  /** Horodatage de la dernière mise à jour (ms) ; `null` avant montage. */
  updatedAt: number | null;
  onRefresh: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bandeau d'état du direct. Il dit la vérité : « En direct » uniquement quand
 * le canal est réellement abonné, sinon « Hors direct » avec l'actualisation
 * manuelle à portée de doigt.
 */
export function LiveBar({
  status,
  refreshing,
  updatedAt,
  onRefresh,
  style,
}: LiveBarProps) {
  const c = useE237Colors();
  const live = status === 'live';
  const connecting = status === 'connecting';
  const Icon = live ? Radio : WifiOff;

  return (
    <View style={[styles.liveBar, style]}>
      <View style={styles.liveLeft}>
        <View
          style={[
            styles.livePill,
            live
              ? {
                  backgroundColor: withAlpha(c.accent, pill.fill.dark),
                  borderColor: withAlpha(c.accent, pill.stroke.dark),
                }
              : { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          {connecting ? (
            <ActivityIndicator size="small" color={c.textMuted} />
          ) : (
            <Icon color={live ? c.accent : c.textMuted} size={14} />
          )}
          <Text
            style={[styles.liveLabel, { color: live ? c.accent : c.textMuted }]}
          >
            {LIVE_STATUS_LABEL[status]}
          </Text>
        </View>
        {updatedAt ? (
          <Text style={[styles.updatedAt, { color: c.textMuted }]}>
            Mis à jour à {formatClock(updatedAt)}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Actualiser le classement"
        accessibilityState={{ disabled: refreshing }}
        disabled={refreshing}
        hitSlop={8}
        onPress={onRefresh}
        style={({ pressed }) => [
          styles.refreshBtn,
          { borderColor: c.border },
          (pressed || refreshing) && styles.pressed,
        ]}
      >
        {refreshing ? (
          <ActivityIndicator size="small" color={c.textMuted} />
        ) : (
          <RefreshCw color={c.textSecondary} size={16} />
        )}
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* MovementCell                                                        */
/* ------------------------------------------------------------------ */

export interface MovementCellProps {
  movement: RankMovement;
  rank: number;
  previousRank: number | null;
  /** Ligne qui vient de bouger en direct (opacité appuyée). */
  flash?: boolean;
}

/** Flèche de mouvement d'une ligne + nombre de places gagnées ou perdues. */
export function MovementCell({
  movement,
  rank,
  previousRank,
  flash = false,
}: MovementCellProps) {
  const places = rankMovementPlaces(movement, rank, previousRank);
  return (
    <TrendArrow
      movement={movement}
      delta={places}
      label={rankMovementLabel(movement, places)}
      style={flash ? styles.flash : undefined}
    />
  );
}

/* ------------------------------------------------------------------ */
/* DivisionCell                                                        */
/* ------------------------------------------------------------------ */

export interface DivisionCellProps {
  /** `null` quand le joueur n'est encore classé dans aucune division. */
  division: { rank: number; name: string; color?: string | null } | null;
  /** Mouvement de GRADE (promotion / rétrogradation), pas de rang. */
  movement?: RankMovement;
}

export function DivisionCell({ division, movement = 'same' }: DivisionCellProps) {
  const c = useE237Colors();
  if (!division) {
    return <Text style={{ color: c.textMuted }}>—</Text>;
  }
  return (
    <View style={styles.divisionCell}>
      <DivisionBadge
        rank={division.rank}
        name={division.name}
        color={division.color}
      />
      {movement === 'same' ? null : (
        <TrendArrow
          movement={movement}
          size={12}
          label={divisionMovementLabel(movement, division.name)}
        />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* RankMedal                                                           */
/* ------------------------------------------------------------------ */

export interface RankMedalProps {
  rank: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Médaillon de rang : or au premier, argent au deuxième, bronze au
 * troisième, simple contour ensuite. Les trois teintes du podium viennent
 * des tokens (`gold`, `textSecondary`, `warning`) — aucune couleur en dur.
 */
export function RankMedal({ rank, style }: RankMedalProps) {
  const c = useE237Colors();
  const podium =
    rank === 1 ? c.gold : rank === 2 ? c.textSecondary : rank === 3 ? c.warning : null;

  return (
    <View
      style={[
        styles.medal,
        podium
          ? { backgroundColor: podium, borderColor: podium }
          : { backgroundColor: 'transparent', borderColor: c.border },
        style,
      ]}
    >
      <Text
        style={[
          styles.medalLabel,
          { color: podium ? c.bg : c.textMuted },
        ]}
      >
        {rank}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PlayerCell                                                          */
/* ------------------------------------------------------------------ */

export interface PlayerCellProps {
  username: string;
  city?: string | null;
  verified?: boolean;
}

/** Cellule « joueur » d'une ligne de classement : pseudo + ville. */
export function PlayerCell({ username, city, verified }: PlayerCellProps) {
  const c = useE237Colors();
  return (
    <View style={styles.playerCell}>
      <View style={styles.playerName}>
        <Text style={[styles.username, { color: c.textPrimary }]} numberOfLines={1}>
          {username}
        </Text>
        {verified ? <VerifiedMark /> : null}
      </View>
      <Text style={[styles.city, { color: c.textMuted }]} numberOfLines={1}>
        {city ?? '—'}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ChampionSpotlight                                                   */
/* ------------------------------------------------------------------ */

export interface ChampionSpotlightProps {
  /** Précision après « Champion » (nom du jeu, saison…). */
  subtitle?: string;
  /** La carte du champion (`PlayerCard` / `GlobalCard`). */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ChampionSpotlight({
  subtitle,
  children,
  style,
}: ChampionSpotlightProps) {
  const c = useE237Colors();
  return (
    <View
      style={[
        styles.spotlight,
        {
          borderColor: withAlpha(c.gold, pill.stroke.dark),
          backgroundColor: withAlpha(c.gold, 0.06),
        },
        style,
      ]}
    >
      <View style={styles.spotlightHead}>
        <Crown color={c.gold} size={18} />
        <Text style={[styles.spotlightTitle, { color: c.gold }]}>
          {`Champion${subtitle ? ` · ${subtitle}` : ''}`}
        </Text>
      </View>
      <View style={styles.spotlightBody}>{children}</View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* RankingSkeleton                                                     */
/* ------------------------------------------------------------------ */

export interface RankingSkeletonProps {
  /** Nombre de lignes fantômes sous la carte du champion (défaut 5). */
  rows?: number;
  /** Affiche la carte du champion (défaut vrai). */
  champion?: boolean;
}

export function RankingSkeleton({
  rows = 5,
  champion = true,
}: RankingSkeletonProps) {
  return (
    <View style={styles.skeleton}>
      {champion ? <Skeleton height={320} /> : null}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={48} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing['2'],
  },
  liveLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'], flex: 1 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1-5'],
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  liveLabel: { fontSize: font.size.xs, fontWeight: font.weight.medium },
  updatedAt: { fontSize: font.size.xs, flexShrink: 1 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  flash: { opacity: 0.75 },
  divisionCell: { flexDirection: 'row', alignItems: 'center', gap: spacing['1-5'] },
  medal: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalLabel: { fontSize: font.size.sm, fontWeight: font.weight.bold },
  playerCell: { flex: 1, gap: 1 },
  playerName: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  username: { fontSize: font.size.sm, fontWeight: font.weight.medium },
  city: { fontSize: font.size.xs },
  spotlight: {
    alignItems: 'center',
    gap: spacing['3'],
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing['5'],
  },
  spotlightHead: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  spotlightTitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  spotlightBody: { width: '100%', maxWidth: 280 },
  skeleton: { gap: spacing['4'] },
});
