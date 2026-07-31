/**
 * Liste d'avantages ou de restrictions (natif) — jumelle de `./web/perk-list`.
 * Icônes Lucide, jamais de puce typographique.
 */
import { Check, Minus } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing, useE237Colors } from './core';

export interface PerkListProps {
  /** Lignes à afficher ; une liste vide ne rend rien. */
  items?: readonly string[] | null;
  /**
   * `perk` (défaut) = ce que la formule apporte (coche verte) ;
   * `limitation` = ce qu'elle n'apporte pas (tiret orange).
   */
  variant?: 'perk' | 'limitation';
  style?: StyleProp<ViewStyle>;
}

export function PerkList({ items, variant = 'perk', style }: PerkListProps) {
  const c = useE237Colors();
  if (!items || items.length === 0) return null;
  const perk = variant === 'perk';
  const Icon = perk ? Check : Minus;
  const iconColor = perk ? c.success : c.warning;
  const textColor = perk ? c.textSecondary : c.textMuted;

  return (
    <View style={[styles.list, style]}>
      {items.map((item, i) => (
        <View key={`${i}-${item}`} style={styles.row}>
          <Icon color={iconColor} size={14} style={styles.icon} />
          <Text style={[styles.text, { color: textColor }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing['1'] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing['1-5'] },
  icon: { marginTop: 2 },
  text: { flex: 1, fontSize: 12 },
});
