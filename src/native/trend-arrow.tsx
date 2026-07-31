/**
 * Flèche de mouvement au classement (natif) — jumelle de `./web/trend-arrow`.
 * Haute VERTE (accent) si le joueur monte, basse ROUGE (danger) s'il descend,
 * tiret discret (textMuted) s'il ne bouge pas. Icônes Lucide, jamais d'emoji.
 */
import { ArrowDown, ArrowUp, Minus } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { font, useE237Colors } from './core';

/** Sens du mouvement au classement. */
export type TrendMovement = 'up' | 'down' | 'same';

export interface TrendArrowProps {
  movement: TrendMovement;
  /** Écart affiché à côté de la flèche (places gagnées/perdues, points…). */
  delta?: number;
  /** Taille de l'icône en px (défaut 14). */
  size?: number;
  /** Libellé accessible personnalisé. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const MOVEMENT_LABEL: Record<TrendMovement, string> = {
  up: 'En hausse',
  down: 'En baisse',
  same: 'Stable',
};

/** Formate l'écart avec son signe (« +3 », « -2 », « 0 »). */
export function formatDelta(movement: TrendMovement, delta: number): string {
  const n = Math.abs(delta);
  if (movement === 'up') return `+${n}`;
  if (movement === 'down') return `-${n}`;
  return `${n}`;
}

export function TrendArrow({
  movement,
  delta,
  size = 14,
  label,
  style,
}: TrendArrowProps) {
  const c = useE237Colors();
  const tone =
    movement === 'up' ? c.accent : movement === 'down' ? c.danger : c.textMuted;
  const Icon =
    movement === 'up' ? ArrowUp : movement === 'down' ? ArrowDown : Minus;
  const text = MOVEMENT_LABEL[movement];
  const full = label ?? (delta != null ? `${text} de ${Math.abs(delta)}` : text);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={full}
      style={[styles.row, style]}
    >
      <Icon color={tone} size={size} strokeWidth={2.5} />
      {delta != null ? (
        <Text style={[styles.delta, { color: tone }]}>
          {formatDelta(movement, delta)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  delta: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    fontVariant: ['tabular-nums'],
  },
});
