/**
 * Bloc de marque « E » + « ESPORT 237 HUB » (natif) — jumeau de la
 * `BrandLockup` du web (même nom, mêmes props sauf `href`, remplacé par
 * `onPress` : le design system ne connaît pas le routeur).
 */
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { font, radius, spacing, useE237Colors } from './core';

export interface BrandLockupProps {
  /** `sm` (32 px) pour les en-têtes, `md` (36 px) pour les écrans d'accueil. */
  size?: 'sm' | 'md';
  /** Masque le mot-symbole et ne garde que la pastille « E ». */
  compact?: boolean;
  /** Rend l'ensemble pressable (retour à l'accueil, par exemple). */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function BrandLockup({
  size = 'sm',
  compact = false,
  onPress,
  style,
}: BrandLockupProps) {
  const c = useE237Colors();
  const box = size === 'md' ? 36 : 32;

  const content = (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.mark,
          { width: box, height: box, backgroundColor: c.accent },
        ]}
      >
        <Text
          style={[
            styles.markLetter,
            { color: c.onAccent, fontSize: size === 'md' ? 18 : 16 },
          ]}
        >
          E
        </Text>
      </View>
      {compact ? null : (
        <Text style={[styles.wordmark, { color: c.textPrimary }]}>
          ESPORT <Text style={{ color: c.accent }}>237</Text> HUB
        </Text>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="ESPORT 237 HUB — accueil"
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  mark: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  markLetter: { fontWeight: font.weight.bold },
  wordmark: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    letterSpacing: -0.2,
  },
  pressed: { opacity: 0.85 },
});
