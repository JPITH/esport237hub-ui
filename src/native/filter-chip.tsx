/**
 * Puce de filtre native — parité stricte avec `.chip` / `.chip--on` du web
 * (`src/theme/components.css`).
 *
 * Retour porteur : « sur mobile il faut pour les pilules des éléments du
 * bouton mettre le fond, sinon ce n'est pas très visible comme sur le web ».
 * Le coupable était la puce INACTIVE, rendue sur fond transparent dans les
 * écrans : ici elle porte toujours `surface` + liseré `border`, exactement
 * comme la version web. La puce active reprend le fond teinté accent dosé
 * par les tokens `pill`.
 */
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  font,
  pill,
  radius,
  spacing,
  useE237Colors,
  useE237Mode,
  withAlpha,
} from './core';

export interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Compteur/statistique affiché dans une sous-pilule (ex. « Douala 12 »). */
  count?: number | null;
  /** Icône Lucide (taille conseillée : 14). */
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FilterChip({
  label,
  active,
  onPress,
  count,
  icon,
  disabled = false,
  style,
}: FilterChipProps) {
  const c = useE237Colors();
  const mode = useE237Mode();
  const ink = active ? c.accent : c.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={count != null ? `${label} (${count})` : label}
      disabled={disabled}
      // La puce mesure 36 px ; le débord rétablit une zone tactile de 44 px.
      hitSlop={{ top: 4, bottom: 4 }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: active ? withAlpha(c.accent, pill.stroke[mode]) : c.border,
          backgroundColor: active
            ? withAlpha(c.accent, pill.fill[mode])
            : c.surface,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: ink, fontWeight: active ? font.weight.bold : font.weight.medium },
        ]}
      >
        {label}
      </Text>
      {count != null ? (
        <View
          style={[
            styles.count,
            {
              backgroundColor: active
                ? withAlpha(c.accent, 0.22)
                : withAlpha(c.textMuted, 0.18),
            },
          ]}
        >
          <Text style={[styles.countText, { color: ink }]}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1-5'],
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing['3'],
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 13 },
  count: {
    minWidth: 20,
    alignItems: 'center',
    borderRadius: radius.full,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: font.weight.bold,
    fontVariant: ['tabular-nums'],
  },
});
