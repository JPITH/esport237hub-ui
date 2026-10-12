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
import { touchTargetBox } from './touch-target';

export interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Compteur/statistique affiché dans une sous-pilule (ex. « Douala 12 »). */
  count?: number | null;
  /** Icône `<Icon>` (taille conseillée : 14). */
  icon?: ReactNode;
  disabled?: boolean;
  /**
   * Rôle annoncé : `button` (filtre, défaut), `radio` (choix unique dans un
   * `RadioGroup variant="inline"`), `tab` (onglet d'une rangée de puces).
   */
  role?: 'button' | 'radio' | 'tab';
  style?: StyleProp<ViewStyle>;
}

export function FilterChip({
  label,
  active,
  onPress,
  count,
  icon,
  disabled = false,
  role = 'button',
  style,
}: FilterChipProps) {
  const c = useE237Colors();
  const mode = useE237Mode();
  const ink = active ? c.accent : c.textSecondary;

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={
        role === 'radio' ? { checked: active, disabled } : { selected: active, disabled }
      }
      accessibilityLabel={count != null ? `${label} (${count})` : label}
      disabled={disabled}
      onPress={onPress}
      // La puce mesure 36 px ; la zone tactile, 44 (audit du 12/10/2026) :
      // `hitSlop` n'existe pas sur le web, la boîte elle-même déborde donc de
      // 4 px en haut et en bas, rendus à la mise en page par une marge négative.
      style={[touchTargetBox(44, CHIP_HEIGHT), styles.hit, style]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.chip,
            {
              borderColor: active ? withAlpha(c.accent, pill.stroke[mode]) : c.border,
              backgroundColor: active ? withAlpha(c.accent, pill.fill[mode]) : c.surface,
            },
            pressed && styles.pressed,
            disabled && styles.disabled,
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
        </View>
      )}
    </Pressable>
  );
}

/** Hauteur visible de la puce. */
const CHIP_HEIGHT = 36;

const styles = StyleSheet.create({
  // La puce remplit la largeur de sa boîte tactile (une puce en `flex: 1`).
  hit: { alignItems: 'stretch' },
  chip: {
    minHeight: CHIP_HEIGHT,
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
