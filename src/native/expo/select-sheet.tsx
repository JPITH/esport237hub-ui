/**
 * SelectSheet backed by `@expo/ui` Picker — même API que `../select-sheet`.
 */
import { Host, Picker } from '@expo/ui';
import { View } from 'react-native';

import { spacing } from '../core';
import type { SelectOption } from '../select-sheet';
import { Txt } from '../text';

export type { SelectOption };

const EMPTY = '__e237_none__';

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
  const selected = value ?? EMPTY;

  return (
    <View style={{ gap: spacing['1'] }}>
      {label ? (
        <Txt variant="subtitle" size={12} tone="secondary">
          {label}
        </Txt>
      ) : null}
      <Host matchContents>
        <Picker
          selectedValue={selected}
          appearance="menu"
          onValueChange={(next) => {
            if (next === EMPTY) return;
            onChange(String(next));
          }}
        >
          <Picker.Item label={placeholder} value={EMPTY} />
          {options.map((o) => (
            <Picker.Item key={o.value} label={o.label} value={o.value} />
          ))}
        </Picker>
      </Host>
    </View>
  );
}
