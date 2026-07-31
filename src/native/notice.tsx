/**
 * Encart d'information teinté (natif) — jumeau de `./web/notice`.
 * Généralise l'`ErrorNote` à tous les tons sémantiques.
 */
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Tone } from '../lib/tone';
import { font, radius, spacing, useE237Colors, useToneColor, useToneSurface } from './core';

/** Icône par défaut de chaque ton — jamais d'emoji (règle DESIGN.md). */
const DEFAULT_ICON: Record<Tone, LucideIcon> = {
  accent: CheckCircle2,
  cyan: Info,
  gold: Lightbulb,
  danger: AlertTriangle,
  warning: AlertTriangle,
  neutral: Info,
};

export interface NoticeProps {
  /** Teinte sémantique — `danger` reproduit exactement l'`ErrorNote`. */
  tone?: Tone;
  /** Icône Lucide personnalisée ; `null` pour aucune icône. */
  icon?: ReactNode | null;
  /** Titre court en gras, au-dessus du corps. */
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Notice({
  tone = 'cyan',
  icon,
  title,
  children,
  style,
}: NoticeProps) {
  const c = useE237Colors();
  const toneColor = useToneColor(tone);
  const surface = useToneSurface(toneColor);
  const textColor = tone === 'neutral' ? c.textSecondary : toneColor;
  const Icon = DEFAULT_ICON[tone];

  return (
    <View style={[styles.note, surface, style]}>
      {icon === null ? null : (icon ?? <Icon color={textColor} size={16} />)}
      <View style={styles.body}>
        {title ? (
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        ) : null}
        <Text selectable style={[styles.text, { color: textColor }]}>
          {children}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing['3'],
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: font.size.sm, fontWeight: font.weight.semibold },
  text: { fontSize: 13 },
});
