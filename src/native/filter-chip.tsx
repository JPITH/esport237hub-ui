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
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  pill,
  radius,
  spacing,
  useE237Colors,
  useE237Mode,
  withAlpha,
} from './core';
import { Txt } from './text';

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
      <Txt
        variant={active ? 'bodyBold' : 'bodyMedium'}
        size={13}
        color={ink}
        numberOfLines={1}
      >
        {label}
      </Txt>
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
          <Txt variant="bodyBold" size={11} color={ink} style={styles.countText}>
            {count}
          </Txt>
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
  count: {
    minWidth: 20,
    alignItems: 'center',
    borderRadius: radius.full,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  // Chiffre tabulaire : la pastille garde la même largeur de 8 à 9.
  countText: { fontVariant: ['tabular-nums'] as const },
});
