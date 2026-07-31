/**
 * Choix du jeu — règle produit (porteur, 22/07/2026) :
 * - 1 seul jeu   → aucune sélection, on l'affiche en statique ;
 * - 2 ou 3 jeux  → boutons « checkbox » (chips à coche) à sélection unique ;
 * - plus de 3    → liste déroulante en feuille (SelectSheet).
 * EA Sports FC est toujours en tête et sert de choix par défaut.
 */
import { pill, radius, spacing, useE237Colors, useE237Mode, withAlpha } from './core';
import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { SelectSheet, type SelectOption } from './select-sheet';
import { Txt } from './text';

const FC_FIRST = ['fc27', 'ea-sports-fc', 'easportsfc', 'fc26', 'fifa'];

export function sortGamesFcFirst(options: SelectOption[]): SelectOption[] {
  return [...options].sort((a, b) => {
    const af = FC_FIRST.includes(a.value) ? 0 : 1;
    const bf = FC_FIRST.includes(b.value) ? 0 : 1;
    return af - bf || a.label.localeCompare(b.label);
  });
}

export function GameSelect({
  options,
  value,
  onChange,
  label = 'Jeu',
}: {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  label?: string;
}) {
  const c = useE237Colors();
  const mode = useE237Mode();
  const sorted = sortGamesFcFirst(options);
  const first = sorted[0]?.value;

  // Défaut : EA Sports FC (premier de la liste triée).
  useEffect(() => {
    if (!value && first) onChange(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, first]);

  if (sorted.length === 0) return null;

  if (sorted.length === 1) {
    return (
      <View style={{ gap: spacing['1'] }}>
        <Txt variant="subtitle" size={12} tone="secondary">
          {label}
        </Txt>
        <View
          style={{
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surface,
            borderRadius: radius.full,
            paddingHorizontal: spacing['3'],
            paddingVertical: spacing['2'],
          }}>
          <Txt variant="label">{sorted[0].label}</Txt>
        </View>
      </View>
    );
  }

  if (sorted.length <= 3) {
    const selected = value ?? first;
    return (
      <View style={{ gap: spacing['1'] }}>
        <Txt variant="subtitle" size={12} tone="secondary">
          {label}
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
          {sorted.map((o) => {
            const active = o.value === selected;
            return (
              <Pressable
                key={o.value}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                onPress={() => onChange(o.value)}
                style={{
                  minHeight: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing['1'],
                  borderWidth: 1,
                  borderColor: active
                    ? withAlpha(c.accent, pill.stroke[mode])
                    : c.border,
                  backgroundColor: active
                    ? withAlpha(c.accent, pill.fill[mode])
                    : c.surface,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing['3'],
                }}>
                {active ? <Check color={c.accent} size={16} /> : null}
                <Txt
                  variant={active ? 'label' : 'subtitle'}
                  size={13}
                  tone={active ? 'accent' : 'secondary'}>
                  {o.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <SelectSheet
      label={label}
      placeholder="Choisir un jeu…"
      options={sorted}
      value={value}
      onChange={onChange}
    />
  );
}
