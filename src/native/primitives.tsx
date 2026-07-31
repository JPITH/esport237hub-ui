/**
 * Primitives d'interface native (sans composites API).
 * Couleurs via useE237Colors() — light et dark (DESIGN.md).
 */
import { AlertCircle, BadgeCheck, Inbox } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import {
  pill,
  radius,
  spacing,
  useE237Colors,
  useE237Mode,
  useToneSurface,
  withAlpha,
} from './core';

export { Field, Textarea, PhoneField, Stepper, SearchField } from './fields';

/** Fond de page + défilement + marges cohérentes sur tous les écrans. */
export function Screen({ children }: { children: ReactNode }) {
  const c = useE237Colors();
  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const c = useE237Colors();
  return <Text style={[styles.sectionTitle, { color: c.cyan }]}>{children}</Text>;
}

export function ErrorNote({ message }: { message: string }) {
  const c = useE237Colors();
  return (
    <View
      style={[
        styles.note,
        { backgroundColor: `${c.danger}18`, borderColor: `${c.danger}66` },
      ]}
    >
      <AlertCircle color={c.danger} size={16} />
      <Text selectable style={{ color: c.danger, fontSize: 13, flex: 1 }}>
        {message}
      </Text>
    </View>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  const c = useE237Colors();
  return (
    <View style={[styles.empty, { borderColor: c.border }]}>
      <Inbox color={c.textMuted} size={22} />
      <Text style={{ color: c.textSecondary, fontSize: 13, textAlign: 'center' }}>
        {children}
      </Text>
    </View>
  );
}

export function Skeleton({ height = 64 }: { height?: number }) {
  const c = useE237Colors();
  return (
    <View style={{ height, borderRadius: radius.lg, backgroundColor: c.surface }} />
  );
}

/** Avatar à initiale — même dosage de fond que les autres pilules natives. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const c = useE237Colors();
  const surface = useToneSurface(c.accent);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...surface,
      }}
    >
      <Text style={{ color: c.accent, fontWeight: '700', fontSize: size * 0.4 }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

/**
 * Marque « joueur vérifié » (icône Lucide BadgeCheck) — jumelle du web.
 * Elle manquait au natif : les écrans posaient l'icône à la main.
 */
export function VerifiedMark({ size = 14 }: { size?: number }) {
  const c = useE237Colors();
  return (
    <BadgeCheck
      color={c.cyan}
      size={size}
      accessibilityLabel="Joueur vérifié"
    />
  );
}

/**
 * Date courte en français — jumelle de `formatDate` du web (même sortie).
 * Elle manquait au natif : chaque application refaisait la sienne.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

/**
 * Onglets segmentés — pastille active qui glisse (timing, sans rebond).
 *
 * Parité web `.seg` / `.seg__pill` : la gouttière prend `surfaceRaised`, la
 * pastille active un fond PLEIN (`surface`) bordé, pas un simple voile teinté
 * — c'est ce qui rend l'onglet actif lisible sur un écran de téléphone.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useE237Colors();
  const mode = useE237Mode();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  );
  const itemWidth = width > 0 ? (width - 8) / tabs.length : 0;

  const pillStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withTiming(index * itemWidth, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    }),
    [index, itemWidth],
  );

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.segment,
        { backgroundColor: c.surfaceRaised, borderColor: c.border },
      ]}
    >
      {itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.segmentPill,
            {
              width: itemWidth,
              backgroundColor: c.surface,
              borderColor: withAlpha(c.accent, pill.stroke[mode]),
            },
            pillStyle,
          ]}
        />
      ) : null}
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <Pressable
            key={t.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 3, bottom: 3 }}
            onPress={() => onChange(t.value)}
            style={styles.segmentItem}
          >
            <Text
              numberOfLines={1}
              style={{
                color: active ? c.accent : c.textSecondary,
                fontWeight: active ? '700' : '500',
                fontSize: 13,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing['4'], gap: spacing['3'], paddingBottom: spacing['12'] },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing['3'],
  },
  empty: {
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing['6'],
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.full,
    padding: 3,
  },
  segmentPill: {
    position: 'absolute',
    left: 3,
    top: 3,
    bottom: 3,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  segmentItem: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    paddingHorizontal: spacing['2'],
  },
});
