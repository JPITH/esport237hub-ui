/**
 * Éditeur de liste de courtes lignes de texte (natif) —
 * jumeau de `./web/string-list-field`.
 */
import { Plus, Trash2 } from 'lucide-react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { font, radius, spacing, useE237Colors } from './core';
import { Field } from './fields';

export interface StringListFieldProps {
  /** Libellé du groupe (« Avantages », « Restrictions »…). */
  label: string;
  placeholder?: string;
  values: readonly string[];
  onChange: (next: string[]) => void;
  /** Nombre maximum de lignes (défaut 12). */
  max?: number;
  /** Longueur maximale d'une ligne (défaut 120). */
  maxLength?: number;
  /** Libellé du bouton d'ajout (défaut « Ajouter »). */
  addLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function StringListField({
  label,
  placeholder,
  values,
  onChange,
  max = 12,
  maxLength = 120,
  addLabel = 'Ajouter',
  style,
}: StringListFieldProps) {
  const c = useE237Colors();

  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      {values.map((value, index) => (
        <View key={index} style={styles.row}>
          <Field
            style={styles.grow}
            placeholder={placeholder}
            maxLength={maxLength}
            value={value}
            onChangeText={(text) => {
              const next = [...values];
              next[index] = text;
              onChange(next);
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retirer cette ligne"
            hitSlop={8}
            onPress={() => onChange(values.filter((_, i) => i !== index))}
            style={({ pressed }) => [
              styles.iconBtn,
              { borderColor: c.border },
              pressed && styles.pressed,
            ]}
          >
            <Trash2 color={c.textMuted} size={18} />
          </Pressable>
        </View>
      ))}
      {values.length < max ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          hitSlop={6}
          onPress={() => onChange([...values, ''])}
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        >
          <Plus color={c.accent} size={16} />
          <Text style={[styles.addLabel, { color: c.accent }]}>{addLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing['2'] },
  label: { fontSize: font.size.xs, fontWeight: font.weight.medium },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing['2'] },
  grow: { flex: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing['1-5'],
    paddingVertical: spacing['1-5'],
  },
  addLabel: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  pressed: { opacity: 0.85 },
});
