import { radius, spacing, useE237Colors } from './core';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sheet } from './sheet';

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
  placeholder = 'Choisir…',
  options,
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const c = useE237Colors();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <View style={{ gap: spacing['1'] }}>
      {label ? (
        <Text style={{ color: c.textSecondary, fontSize: 12, fontWeight: '500' }}>{label}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text
          numberOfLines={1}
          style={{ color: selected ? c.textPrimary : c.textMuted, fontSize: 15, flex: 1 }}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown color={c.textSecondary} size={18} />
      </Pressable>

      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <ScrollView style={{ maxHeight: 360 }}>
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
                <Text
                  style={{
                    color: active ? c.accent : c.textPrimary,
                    fontWeight: active ? '700' : '400',
                    fontSize: 15,
                    flex: 1,
                  }}>
                  {o.label}
                </Text>
                {active ? <Check color={c.accent} size={18} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
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
