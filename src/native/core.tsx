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

import {
  color,
  font,
  pill,
  radius,
  spacing,
  withAlpha,
  type ColorScale,
  type ThemeMode,
} from '../tokens';

export { color, font, pill, radius, spacing, withAlpha };
export type { ColorScale, ThemeMode };

/** Mode actif (dark par défaut, ADN de la marque). */
export function useE237Mode(): ThemeMode {
  return useColorScheme() === 'light' ? 'light' : 'dark';
}

/** Palette active selon le mode système (dark par défaut, ADN de la marque). */
export function useE237Colors(): ColorScale {
  return useE237Mode() === 'light' ? color.light : color.dark;
}

/**
 * Fond + liseré d'une pilule teintée, dosés selon le mode (cf. `pill` dans
 * les tokens). À utiliser partout où le web pose un
 * `color-mix(in srgb, <teinte> N%, transparent)`.
 */
export function useToneSurface(tone: string): {
  backgroundColor: string;
  borderColor: string;
} {
  const mode = useE237Mode();
  return {
    backgroundColor: withAlpha(tone, pill.fill[mode]),
    borderColor: withAlpha(tone, pill.stroke[mode]),
  };
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

export type BadgeTone =
  | 'accent'
  | 'cyan'
  | 'gold'
  | 'danger'
  | 'warning'
  | 'neutral';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
  /** Surcharge du libellé (taille/police) — le cadre reste celui du DS. */
  textStyle?: StyleProp<TextStyle>;
}

/** Résout un ton sémantique en couleur de la palette active. */
export function useToneColor(tone: BadgeTone): string {
  const c = useE237Colors();
  return tone === 'cyan'
    ? c.cyan
    : tone === 'gold'
      ? c.gold
      : tone === 'danger'
        ? c.danger
        : tone === 'warning'
          ? c.warning
          : tone === 'neutral'
            ? c.textSecondary
            : c.accent;
}

/**
 * Pilule d'état (parité `.e237-badge`). Le fond teinté est plus appuyé que
 * sur le web et un liseré de la même teinte dessine la forme : sans lui la
 * pilule disparaissait sur un téléphone en plein jour (retour porteur).
 */
export function Badge({ children, tone = 'accent', style, textStyle }: BadgeProps) {
  const toneColor = useToneColor(tone);
  const surface = useToneSurface(toneColor);

  return (
    <View style={[styles.badge, surface, style]}>
      <Text style={[styles.badgeLabel, { color: toneColor }, textStyle]}>
        {children}
      </Text>
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
    borderWidth: 1,
    /* -1 px de padding vertical pour compenser le liseré : hauteur inchangée. */
    paddingVertical: 2,
    paddingHorizontal: 9,
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
