import { spacing, useE237Colors } from './core';
import { StyleSheet, Text, View } from 'react-native';

import { Stepper } from './fields';

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
  const c = useE237Colors();

  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        <Text numberOfLines={1} style={{ color: c.textSecondary, fontSize: 12 }}>
          {challengerName}
        </Text>
        <Stepper
          value={value.challenger}
          onChange={(n) => onChange({ ...value, challenger: n })}
          min={0}
          max={99}
        />
      </View>

      <Text style={{ color: c.textMuted, fontSize: 18, fontWeight: '700' }}>–</Text>

      <View style={styles.side}>
        <Text numberOfLines={1} style={{ color: c.textSecondary, fontSize: 12 }}>
          {opponentName}
        </Text>
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
