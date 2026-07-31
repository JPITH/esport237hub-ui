/**
 * Primitives d'interface native (sans composites API).
 * Couleurs via useE237Colors() — light et dark (DESIGN.md).
 */
import { AlertCircle, BadgeCheck, Inbox } from 'lucide-react-native';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  pill,
  radius,
  spacing,
  useE237Colors,
  useE237Mode,
  useToneSurface,
  withAlpha,
} from './core';
import { haptic } from './haptics';
import { Txt } from './text';

export { Field, Textarea, PhoneField, Stepper, SearchField } from './fields';

type ScreenScrollProps = {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentInsetAdjustmentBehavior?: 'automatic' | 'never' | 'scrollableAxes' | 'always';
  keyboardShouldPersistTaps?: boolean | 'handled' | 'always' | 'never';
  showsVerticalScrollIndicator?: boolean;
  bottomOffset?: number;
  extraKeyboardSpace?: number;
  children?: ReactNode;
};

/** Fond de page + défilement. Passe `ScrollComponent` pour le clavier-aware. */
export function Screen({
  children,
  ScrollComponent = ScrollView,
  padBottom,
  contentStyle,
  safeTop = true,
}: {
  children: ReactNode;
  ScrollComponent?: ComponentType<ScreenScrollProps>;
  /** Réserve sous le contenu — à régler sur la hauteur de la tab bar flottante. */
  padBottom?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Décale le contenu sous l’encoche / status bar (TopBar uniforme).
   * Défaut `true` ; les onglets (`TabScreen`) et les écrans déjà dans un
   * `SafeAreaView` passent `false`.
   */
  safeTop?: boolean;
}) {
  const c = useE237Colors();
  const insets = useSafeAreaInsets();
  const Scroll = ScrollComponent;
  return (
    <Scroll
      style={{ backgroundColor: c.bg, flex: 1 }}
      contentContainerStyle={[
        styles.screen,
        // Remplace le `paddingTop` du shorthand : encoche + même air que les côtés.
        safeTop && { paddingTop: insets.top + spacing['4'] },
        padBottom != null && { paddingBottom: padBottom },
        contentStyle,
      ]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={24}
      extraKeyboardSpace={12}
    >
      {children}
    </Scroll>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Txt variant="overline" tone="cyan">
      {children}
    </Txt>
  );
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
      <Txt selectable variant="body" tone="danger" style={{ flex: 1 }}>
        {message}
      </Txt>
    </View>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  const c = useE237Colors();
  return (
    <View style={[styles.empty, { borderColor: c.border }]}>
      <Inbox color={c.textMuted} size={22} />
      <Txt variant="body" tone="secondary" align="center">
        {children}
      </Txt>
    </View>
  );
}

/**
 * Bloc fantôme AVEC balayage lumineux (« shimmer »).
 *
 * Le shimmer n'est pas décoratif : il distingue « ça charge » de « c'est vide
 * et ça restera vide ». Un bloc figé ressemble à une carte cassée ; un bloc qui
 * respire annonce une arrivée. C'est aussi ce qui couvre les BASCULES de
 * contenu (changement de discipline sur le classement) : la liste ne saute pas
 * d'un état à l'autre, elle passe par un état de chargement lisible.
 *
 * La bande est en `pointerEvents="none"` et l'animation est purement visuelle :
 * elle ne retarde ni ne bloque l'affichage des données quand elles arrivent.
 */
export function Skeleton({ height = 64 }: { height?: number }) {
  const c = useE237Colors();
  // Largeur mesurée : la bande se déplace d'une largeur d'écran à l'autre, il
  // faut donc la connaître. Tant qu'elle vaut 0, seul le fond est peint.
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (width === 0) return;
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [width, progress]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -width + progress.value * 2 * width }],
  }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        height,
        borderRadius: radius.lg,
        backgroundColor: c.surface,
        overflow: 'hidden',
      }}
    >
      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: width * 0.6,
            },
            bandStyle,
          ]}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="e237Shimmer" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={c.textPrimary} stopOpacity={0} />
                <Stop offset="0.5" stopColor={c.textPrimary} stopOpacity={0.07} />
                <Stop offset="1" stopColor={c.textPrimary} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#e237Shimmer)" />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Avatar à initiale ou photo — même dosage de fond que les autres pilules natives. */
export function Avatar({
  name,
  size = 44,
  src,
}: {
  name: string;
  size?: number;
  /** URI locale ou URL distante (sinon initiale). */
  src?: string | null;
}) {
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
        overflow: 'hidden',
        ...surface,
      }}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size }}
          accessibilityLabel={name}
        />
      ) : (
        <Txt variant="title" tone="accent" size={size * 0.4}>
          {name.charAt(0).toUpperCase()}
        </Txt>
      )}
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
            onPress={() => {
              haptic('selection');
              onChange(t.value);
            }}
            style={styles.segmentItem}
          >
            <Txt
              numberOfLines={1}
              variant={active ? 'label' : 'subtitle'}
              tone={active ? 'accent' : 'secondary'}
              size={13}
            >
              {t.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing['4'], gap: spacing['3'], paddingBottom: spacing['12'] },
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
