import { spacing } from './core';
import { StyleSheet, View } from 'react-native';

import { Stepper } from './fields';
import { Txt } from './text';

/** Saisie du score d'un duel : deux steppers − / + et les deux pseudos. */
export function ScoreInput({
  challengerName,
  opponentName,
  value,
  onChange,
}: {
  challengerName: string;
  opponentName: string;
  value: { challenger: number; opponent: number };
  onChange: (next: { challenger: number; opponent: number }) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        <Txt numberOfLines={1} variant="caption" tone="secondary">
          {challengerName}
        </Txt>
        <Stepper
          value={value.challenger}
          onChange={(n) => onChange({ ...value, challenger: n })}
          min={0}
          max={99}
        />
      </View>

      <Txt variant="numeric" size={18} tone="muted">
        –
      </Txt>

      <View style={styles.side}>
        <Txt numberOfLines={1} variant="caption" tone="secondary">
          {opponentName}
        </Txt>
        <Stepper
          value={value.opponent}
          onChange={(n) => onChange({ ...value, opponent: n })}
          min={0}
          max={99}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing['4'],
  },
  side: { flex: 1, alignItems: 'center', gap: spacing['1'] },
});
