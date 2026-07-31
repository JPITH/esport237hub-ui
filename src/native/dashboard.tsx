/**
 * Tuiles de dashboard — fondations des futurs écrans « Ma salle » (proprio)
 * et accueil joueur personnalisé (ROADMAP §4). Références : Stripe Dashboard
 * (KPI du jour), Revolut Business (rangée d'actions rapides), Whatnot Seller
 * Hub (groupes de tuiles).
 *
 * Les icônes sont passées en ReactNode (Lucide côté app) : le design system
 * ne dépend d'aucune librairie d'icônes — et jamais d'emojis.
 */
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Card, font, fontFamily, radius, spacing, useE237Colors } from './core';
import { haptic } from './haptics';

/* ------------------------------------------------------------------ */
/* StatTile                                                            */
/* ------------------------------------------------------------------ */

export interface StatTileTrend {
  /** Texte affiché tel quel (ex. « +12 % vs 7 j »). */
  label: string;
  direction: 'up' | 'down' | 'flat';
}

export interface StatTileProps {
  /** Valeur principale, déjà formatée (ex. « 12 500 FCFA »). */
  value: string | number;
  label: string;
  /** Précision optionnelle sous le libellé (ex. « aujourd'hui »). */
  hint?: string;
  trend?: StatTileTrend;
  /** Icône Lucide (taille conseillée : 18). */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Tuile KPI en carte : à poser en rangée (`flexDirection: 'row'`, flex: 1). */
export function StatTile({ value, label, hint, trend, icon, style }: StatTileProps) {
  const c = useE237Colors();
  const trendColor =
    trend?.direction === 'up'
      ? c.success
      : trend?.direction === 'down'
        ? c.danger
        : c.textSecondary;

  return (
    <Card style={[styles.tile, style]}>
      <View style={styles.tileHead}>
        <Text style={[styles.tileLabel, { color: c.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        {icon}
      </View>
      <Text style={[styles.tileValue, { color: c.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {trend ? (
        <Text style={[styles.tileMeta, { color: trendColor }]} numberOfLines={1}>
          {trend.label}
        </Text>
      ) : hint ? (
        <Text style={[styles.tileMeta, { color: c.textMuted }]} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* QuickAction                                                         */
/* ------------------------------------------------------------------ */

export interface QuickActionProps {
  /** Icône Lucide (taille conseillée : 20). */
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Action rapide de dashboard : pastille ronde + libellé dessous.
 * À poser en rangée (ex. ouvrir le check-in, scanner un billet, saisir
 * un résultat). Zone tactile ≥ 44 px.
 */
export function QuickAction({ icon, label, onPress, disabled, style }: QuickActionProps) {
  const c = useE237Colors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled) haptic('light');
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.quick,
        pressed && styles.quickPressed,
        disabled && styles.quickDisabled,
        style,
      ]}
    >
      <View
        style={[
          styles.quickIcon,
          { backgroundColor: c.surfaceRaised, borderColor: c.border },
        ]}
      >
        {icon}
      </View>
      <Text style={[styles.quickLabel, { color: c.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: spacing['1'],
    paddingVertical: spacing['3'],
  },
  tileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing['2'],
  },
  tileLabel: {
    flexShrink: 1,
    fontFamily: fontFamily.displaySemi,
    fontSize: font.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tileValue: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: font.size.xl,
    fontVariant: ['tabular-nums'],
  },
  tileMeta: { fontFamily: fontFamily.bodyMedium, fontSize: font.size.xs },
  quick: {
    alignItems: 'center',
    gap: spacing['1'],
    minWidth: 64,
    minHeight: 44,
  },
  quickPressed: { opacity: 0.85 },
  quickDisabled: { opacity: 0.5 },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontFamily: fontFamily.displaySemi, fontSize: font.size.xs },
});
