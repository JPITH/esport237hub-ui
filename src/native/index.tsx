/**
 * Composants React Native ESPORT 237 HUB (Expo).
 *
 * Mêmes tokens que le web (src/tokens) ; le mode light/dark suit
 * useColorScheme(). API volontairement parallèle à ./web pour que les
 * écrans mobiles et web se ressemblent trait pour trait.
 */
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { color, font, radius, spacing, type ColorScale, type ThemeMode } from '../tokens';

export { color, font, radius, spacing };
export type { ColorScale, ThemeMode };

/** Palette active selon le mode système (dark par défaut, ADN de la marque). */
export function useE237Colors(): ColorScale {
  const scheme = useColorScheme();
  return scheme === 'light' ? color.light : color.dark;
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  const c = useE237Colors();
  const containerStyle: ViewStyle[] = [styles.btn];
  const labelStyle: TextStyle[] = [styles.btnLabel];

  if (variant === 'primary') {
    containerStyle.push({ backgroundColor: c.accent });
    labelStyle.push({ color: c.onAccent });
  } else if (variant === 'secondary') {
    containerStyle.push({ borderWidth: 1, borderColor: c.border });
    labelStyle.push({ color: c.textPrimary });
  } else {
    labelStyle.push({ color: c.accent });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        containerStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const c = useE237Colors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export interface BadgeProps {
  children: ReactNode;
  tone?: 'accent' | 'cyan' | 'gold' | 'danger' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ children, tone = 'accent', style }: BadgeProps) {
  const c = useE237Colors();
  const toneColor =
    tone === 'cyan'
      ? c.cyan
      : tone === 'gold'
        ? c.gold
        : tone === 'danger'
          ? c.danger
          : tone === 'neutral'
            ? c.textSecondary
            : c.accent;

  return (
    <View style={[styles.badge, { backgroundColor: `${toneColor}24` }, style]}>
      <Text style={[styles.badgeLabel, { color: toneColor }]}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */

export interface StatProps {
  value: string | number;
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function Stat({ value, label, style }: StatProps) {
  const c = useE237Colors();
  return (
    <View style={style}>
      <Text style={[styles.statValue, { color: c.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SectionLabel                                                        */
/* ------------------------------------------------------------------ */

export interface SectionLabelProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  const c = useE237Colors();
  return (
    <Text style={[styles.sectionLabel, { color: c.cyan }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing['2'],
    paddingVertical: 10,
    paddingHorizontal: spacing['5'],
    borderRadius: radius.md,
  },
  btnLabel: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing['5'],
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeLabel: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
  },
  statValue: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
  },
  statLabel: {
    fontSize: font.size.xs,
  },
  sectionLabel: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
