import { radius, spacing, useE237Colors } from './core';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FieldLabel, requiredFieldLabel } from './fields';
import { Sheet } from './sheet';
import { Txt } from './text';
import { useDsT } from '../i18n';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Sélecteur en feuille modale : la liste s'ouvre par le bas, chaque option est
 * une zone tactile pleine largeur (≥ 44 px, exigence du cahier §13).
 */
export function SelectSheet({
  label,
  required,
  placeholder = 'Choisir…',
  options,
  value,
  onChange,
}: {
  label?: string;
  /** Champ obligatoire : un astérisque suit le libellé (`FieldLabel`). */
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const c = useE237Colors();
  const t = useDsT();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <View style={{ gap: spacing['1'] }}>
      {label ? <FieldLabel label={label} required={required} /> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={requiredFieldLabel(t, label, required)}
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Txt
          numberOfLines={1}
          variant="body"
          size={15}
          tone={selected ? 'primary' : 'muted'}
          style={{ flex: 1 }}>
          {selected?.label ?? placeholder}
        </Txt>
        <ChevronDown color={c.textSecondary} size={18} />
      </Pressable>

      {/* Pas de vue défilante ici : la feuille défile d'elle-même depuis le
          21/09/2026, et deux défilements verticaux imbriqués se disputent le
          doigt. Le plafond de 360 px disparaissait aussi la liste sous l'écran
          quand elle était longue — c'est la feuille qui plafonne, maintenant. */}
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <>
          {options.map((o) => {
            const active = o.value === value;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={[styles.option, { borderBottomColor: c.border }]}>
                <Txt
                  variant={active ? 'label' : 'body'}
                  size={15}
                  tone={active ? 'accent' : 'primary'}
                  style={{ flex: 1 }}>
                  {o.label}
                </Txt>
                {active ? <Check color={c.accent} size={18} /> : null}
              </Pressable>
            );
          })}
        </>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing['3'],
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
