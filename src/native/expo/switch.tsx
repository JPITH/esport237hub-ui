/**
 * Ligne de réglage avec Switch natif `@expo/ui`.
 */
import { Host, Switch } from '@expo/ui';
import { View } from 'react-native';

export function SwitchRow({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ minHeight: 44, justifyContent: 'center' }}>
      <Host matchContents>
        <Switch
          label={label}
          value={value}
          disabled={disabled}
          onValueChange={onValueChange}
        />
      </Host>
    </View>
  );
}

/** Alias direct pour les cas sans label de ligne. */
export { Switch as ExpoSwitch };
