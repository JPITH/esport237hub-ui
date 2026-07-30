/**
 * Pilule de division — affiche le RANG (« DIV 1 », « DIV 3 ») et non le nom
 * de la division (décision porteur : « Challenger » ne dit pas au joueur où
 * il se situe). Le nom reste porté par `accessibilityLabel` : l'information
 * n'est pas perdue pour les lecteurs d'écran.
 */
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { font, radius, useE237Colors, useToneSurface } from './core';

export interface DivisionBadgeProps {
  /** Rang de la division (1 = la plus haute). */
  rank: number;
  /** Nom complet de la division (« Élite », « Challenger »…) — accessibilité. */
  name?: string;
  /** Couleur de la division fournie par le back-office (hex). */
  color?: string | null;
  /** Surcharge du cadre (utilisée par PlayerCard pour garder ses dimensions). */
  style?: StyleProp<ViewStyle>;
  /** Surcharge du libellé (police/taille de la carte joueur). */
  textStyle?: StyleProp<TextStyle>;
}

/** Libellé court affiché dans la pilule. */
export function divisionLabel(rank: number): string {
  return `DIV ${rank}`;
}

/** Libellé long, lu par les lecteurs d'écran (garde le nom de la division). */
export function divisionAccessibleLabel(rank: number, name?: string): string {
  return name ? `Division ${rank} — ${name}` : `Division ${rank}`;
}

export function DivisionBadge({
  rank,
  name,
  color: divisionColor,
  style,
  textStyle,
}: DivisionBadgeProps) {
  const c = useE237Colors();
  const tone = divisionColor ?? c.cyan;
  const surface = useToneSurface(tone);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={divisionAccessibleLabel(rank, name)}
      style={[styles.badge, surface, style]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={[styles.label, { color: tone }, textStyle]}
      >
        {divisionLabel(rank)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: 2,
    paddingHorizontal: 9,
  },
  label: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    letterSpacing: 0.8,
  },
});
