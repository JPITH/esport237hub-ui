/**
 * Case à cocher et groupe radio (natif) — jumeaux de `./web/choice`.
 *
 * Ils comblaient un vrai manque du design system : les écrans posaient des
 * pastilles à la main, avec des dosages de teinte tous différents.
 */
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Badge, radius, spacing, useE237Colors } from './core';
import { FilterChip } from './filter-chip';
import { Txt } from './text';
import { Icon } from '../icons/generated/native';

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Libellé pressable à droite de la case. */
  label: string;
  /** Précision sous le libellé. */
  hint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  style,
}: CheckboxProps) {
  const c = useE237Colors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [
        styles.row,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? c.accent : c.border,
            backgroundColor: checked ? c.accent : c.surface,
          },
        ]}
      >
        {checked ? <Icon name="check" color={c.onAccent} size={13} strokeWidth={3} /> : null}
      </View>
      <View style={styles.labelBox}>
        <Txt variant="body">{label}</Txt>
        {hint ? (
          <Txt variant="caption" tone="muted">{hint}</Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* RadioGroup                                                          */
/* ------------------------------------------------------------------ */

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  /** Valeur affichée à droite (prix, disponibilité…). */
  trailing?: ReactNode;
  /** Icône posée avant le libellé (variante `card`) — parité web. */
  icon?: ReactNode;
  /** Courte étiquette neutre à côté du libellé (variante `card`) — parité web. */
  badge?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  /** Libellé du groupe — lu par les lecteurs d'écran. */
  label: string;
  options: readonly RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** `card` (défaut) = options encadrées ; `inline` = puces alignées (`FilterChip`). */
  variant?: 'card' | 'inline';
  style?: StyleProp<ViewStyle>;
}

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = 'card',
  style,
}: RadioGroupProps<T>) {
  const c = useE237Colors();
  if (variant === 'inline') {
    return (
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.inline, style]}>
        {options.map((option) => (
          <FilterChip
            key={option.value}
            role="radio"
            label={option.label}
            active={option.value === value}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    );
  }
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.group, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: option.disabled }}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              {
                borderColor: selected ? c.accent : c.border,
                backgroundColor: c.surface,
              },
              option.disabled && styles.disabled,
              pressed && !option.disabled && styles.pressed,
            ]}
          >
            <View style={styles.optionMain}>
              <View style={[styles.radio, { borderColor: selected ? c.accent : c.border }]}>
                {selected ? (
                  <View style={[styles.radioDot, { backgroundColor: c.accent }]} />
                ) : null}
              </View>
              {option.icon ? <View style={styles.optionIcon}>{option.icon}</View> : null}
              <View style={styles.labelBox}>
                {option.badge ? (
                  <View style={styles.labelRow}>
                    <Txt variant="body" style={styles.shrink}>
                      {option.label}
                    </Txt>
                    <Badge tone="neutral" size="sm">
                      {option.badge}
                    </Badge>
                  </View>
                ) : (
                  <Txt variant="body">{option.label}</Txt>
                )}
                {option.hint ? (
                  <Txt variant="caption" tone="muted">
                    {option.hint}
                  </Txt>
                ) : null}
              </View>
            </View>
            {option.trailing ? (
              <Txt variant="label" tone="accent">
                {option.trailing}
              </Txt>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing['2'] },
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBox: { flex: 1, gap: 2 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  group: { gap: spacing['2'] },
  inline: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  optionIcon: { width: 28, alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing['2'] },
  shrink: { flexShrink: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing['3'],
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing['3'],
  },
  optionMain: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: spacing['2'] },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: radius.full },
});
