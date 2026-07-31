/**
 * Recherche d'adversaire « à la Tinder » : carte joueur + swipe L/R (suivant)
 * et vers le haut (feuille d'infos). Reanimated + gesture-handler.
 */
import { ChevronsLeftRight, ChevronsUp, MapPin, Swords } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button, radius, spacing, useE237Colors, useNeu } from './core';
import { haptic } from './haptics';
import { PlayerCard } from './player-card';
import { EmptyState } from './primitives';
import { Sheet } from './sheet';
import { Txt } from './text';

export interface SwipePlayer {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses?: number;
  points?: number;
  city?: string | null;
  platform?: string | null;
  gameSlug?: string;
  gameName?: string;
  stats?: Record<string, number> | null;
  division?: string | null;
  imageUrl?: string | null;
}

const X_THRESHOLD = 90;
const UP_THRESHOLD = -80;
const FLY_OUT = 520;

export function SwipeDeck({
  players,
  onPlay,
  onViewProfile,
}: {
  players: SwipePlayer[];
  onPlay: (player: SwipePlayer) => void;
  /** Ouvre le profil public (bouton « Voir » de la feuille). */
  onViewProfile?: (player: SwipePlayer) => void;
}) {
  const c = useE237Colors();
  const neu = useNeu();
  const [index, setIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const current = players[index];
  const next = players[index + 1];

  const advance = () => {
    tx.value = 0;
    ty.value = 0;
    setIndex((i) => i + 1);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .activeOffsetY(-12)
    .failOffsetY(12)
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = Math.min(0, e.translationY);
    })
    .onEnd((e) => {
      const horizontal = Math.abs(e.translationX) > X_THRESHOLD;
      if (!horizontal && e.translationY < UP_THRESHOLD) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        runOnJS(setShowInfo)(true);
      } else if (horizontal) {
        const dir = Math.sign(e.translationX);
        ty.value = withTiming(e.translationY, { duration: 180 });
        tx.value = withTiming(dir * FLY_OUT, { duration: 180 }, (done) => {
          if (done) runOnJS(advance)();
        });
      } else {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
      }
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${tx.value / 18}deg` },
    ],
  }));

  const nextStyle = useAnimatedStyle(() => {
    const p = Math.min(1, Math.abs(tx.value) / 220);
    return {
      transform: [{ scale: 0.94 + 0.06 * p }],
      opacity: 0.6 + 0.4 * p,
    };
  });

  if (!current) {
    return (
      <View style={{ gap: spacing['3'] }}>
        <EmptyState>Plus aucun joueur à afficher pour ces critères.</EmptyState>
        {players.length > 0 ? (
          <Button label="Revoir les joueurs" variant="secondary" onPress={() => setIndex(0)} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: spacing['3'] }}>
      <View style={styles.deck}>
        {next ? (
          <Animated.View style={[StyleSheet.absoluteFill, nextStyle]} pointerEvents="none">
            <PlayerCard
              username={next.username}
              rating={next.rating}
              wins={next.wins}
              city={next.city}
              gameSlug={next.gameSlug}
              gameName={next.gameName}
              stats={next.stats}
              division={next.division}
              imageUrl={next.imageUrl}
            />
          </Animated.View>
        ) : null}

        <GestureDetector gesture={pan}>
          <Animated.View style={topStyle}>
            <PlayerCard
              username={current.username}
              rating={current.rating}
              wins={current.wins}
              city={current.city}
              gameSlug={current.gameSlug}
              gameName={current.gameName}
              stats={current.stats}
              division={current.division}
              imageUrl={current.imageUrl}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      <Button label={`Duel · ${current.username}`} onPress={() => onPlay(current)} />

      <View style={styles.hints}>
        <View style={styles.hint}>
          <ChevronsLeftRight color={c.textMuted} size={14} />
          <Txt variant="caption" size={11} tone="muted">
            joueur suivant
          </Txt>
        </View>
        <View style={styles.hint}>
          <ChevronsUp color={c.textMuted} size={14} />
          <Txt variant="caption" size={11} tone="muted">
            plus d&rsquo;infos
          </Txt>
        </View>
      </View>

      <Sheet
        open={showInfo}
        onClose={() => setShowInfo(false)}
        title={current.username}
        subtitle={
          [current.gameName, current.division, current.city].filter(Boolean).join(' · ') ||
          undefined
        }
        footer={
          <View style={styles.actions}>
            <Button
              label="Duel"
              style={styles.actionBtn}
              onPress={() => {
                setShowInfo(false);
                onPlay(current);
              }}
            />
            {onViewProfile ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Voir le profil de ${current.username}`}
                onPress={() => {
                  haptic('light');
                  setShowInfo(false);
                  onViewProfile(current);
                }}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.voirBtn,
                  { backgroundColor: c.cyan },
                  pressed ? neu.pressedSm : neu.primaryGlow(c.cyan),
                ]}
              >
                <Txt variant="label" style={{ color: c.onAccent }}>
                  Voir
                </Txt>
              </Pressable>
            ) : null}
          </View>
        }
      >
        <View style={styles.infoBlock}>
          <View style={[styles.heroChip, { backgroundColor: `${c.accent}22` }]}>
            <Swords color={c.accent} size={18} />
            <Txt variant="label" tone="accent">
              Note {current.rating}
            </Txt>
          </View>

          <InfoRow label="Jeu" value={current.gameName ?? '—'} />
          <InfoRow
            label="Bilan"
            value={`${current.wins} V${current.losses != null ? ` / ${current.losses} D` : ''}`}
          />
          {current.points != null ? (
            <InfoRow label="Points" value={String(current.points)} />
          ) : null}
          <InfoRow
            label="Ville"
            value={current.city ?? '—'}
            icon={<MapPin color={c.textSecondary} size={14} />}
          />
          <InfoRow label="Plateforme" value={current.platform?.toUpperCase() ?? '—'} />
        </View>
      </Sheet>
    </View>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <Txt variant="body" tone="secondary">
        {label}
      </Txt>
      <View style={styles.infoValue}>
        {icon}
        <Txt variant="label">{value}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['4'],
  },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoBlock: { gap: spacing['2'] },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    marginBottom: spacing['1'],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
  },
  infoValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', gap: spacing['2'] },
  actionBtn: { flex: 1, minHeight: 44 },
  voirBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderCurve: 'continuous',
  },
});
