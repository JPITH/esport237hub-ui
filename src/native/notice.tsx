/**
 * Encart d'information teinté (natif) — jumeau de `./web/notice`.
 * Généralise l'`ErrorNote` à tous les tons sémantiques.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Tone } from '../lib/tone';
import { radius, spacing, useE237Colors, useToneColor, useToneSurface } from './core';
import { Txt } from './text';
import { Icon } from '../icons/generated/native';
import type { IconName } from '../icons/names';

/** Icône par défaut de chaque ton — jamais d'emoji (règle DESIGN.md). */
const DEFAULT_ICON: Record<Tone, IconName> = {
  accent: 'check-circle',
  cyan: 'info',
  success: 'check-circle',
  info: 'info',
  gold: 'lightbulb',
  danger: 'alert-triangle',
  warning: 'alert-triangle',
  neutral: 'info',
};

export interface NoticeProps {
  /** Teinte sémantique — `danger` reproduit exactement l'`ErrorNote`. */
  tone?: Tone;
  /** Icône personnalisée (`<Icon name=… />`) ; `null` pour aucune icône. */
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

  return (
    <View style={[styles.note, surface, style]}>
      {icon === null ? null : (icon ?? <Icon name={DEFAULT_ICON[tone]} color={textColor} size={16} />)}
      <View style={styles.body}>
        {title ? (
          <Txt variant="label" color={textColor}>{title}</Txt>
        ) : null}
        <Txt selectable variant="body" size={13} color={textColor}>
          {children}
        </Txt>
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
});
