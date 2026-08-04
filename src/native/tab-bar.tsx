/**
 * Barre d'onglets courbée avec FAB central « Duels » (Game Hub).
 * Couleurs via useE237Colors() — light et dark.
 *
 * Parti pris (31/07/2026) : les onglets latéraux sont des ICÔNES SEULES,
 * surmontées d'un point quand ils sont actifs ; seul le FAB porte son nom,
 * posé SOUS le cercle. Cinq libellés alignés sous cinq icônes serraient la
 * barre au point de tronquer « Compétitions », et un mot dans le FAB écrasait
 * son pictogramme. Les libellés restent annoncés aux lecteurs d'écran via
 * `accessibilityLabel` : c'est du bruit visuel en moins, pas de l'information
 * en moins.
 *
 * Composition revue (04/08/2026), règle « deux clics maximum » : la barre
 * porte désormais les cinq surfaces où l'on VA — Accueil, Salles, Duels,
 * Évènements, Boutique. Le Classement et le Profil en sortent : ce sont des
 * écrans qu'on consulte, pas des lieux où l'on travaille, et l'appbar commune
 * les tient déjà à un appui (avatar à droite, lien depuis le profil).
 */
import type { LucideIcon } from 'lucide-react-native';
import { CalendarDays, House, ShoppingBag, Store, Swords } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { font, radius, spacing, useE237Colors } from './core';
import { haptic } from './haptics';
import { Txt } from './text';

const BAR_HEIGHT = 64;
const FAB_SIZE = 58;
const NOTCH_HALF = 42;

/**
 * Réserve à laisser sous le contenu d'un écran à onglets (la barre est
 * flottante) : `Screen padBottom={TAB_BAR_SPACE + insets.bottom}`.
 */
export const TAB_BAR_SPACE = BAR_HEIGHT + 32;

/**
 * Une route sans entrée ici n'est pas rendue dans la barre (`if (!meta)`) :
 * ajouter un onglet, c'est ajouter sa ligne ici ET son `Tabs.Screen` côté app.
 */
const TAB_META: Record<
  string,
  { label: string; Icon: LucideIcon; fab?: boolean }
> = {
  index: { label: 'Accueil', Icon: House },
  salles: { label: 'Salles', Icon: Store },
  duels: { label: 'Duels', Icon: Swords, fab: true },
  evenements: { label: 'Évènements', Icon: CalendarDays },
  boutique: { label: 'Boutique', Icon: ShoppingBag },
};

export interface E237TabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarAccessibilityLabel?: string;
      };
    }
  >;
  /**
   * Méthodes en syntaxe abrégée (et non en propriétés-fonctions) : les
   * paramètres restent bivariants, donc l'objet `navigation` typé par
   * React Navigation reste assignable. `emit` renvoie `unknown` pour la
   * même raison — l'`EventArg` de React Navigation est générique.
   */
  navigation: {
    emit(event: {
      type: string;
      target?: string;
      canPreventDefault?: boolean;
    }): unknown;
    navigate(name: string, params?: object): void;
  };
  /** Marge basse (encoche / barre système) — fournie par l'app. */
  safeAreaBottom?: number;
}

/** Trace la barre sombre avec encoche centrale pour le FAB Duels. */
function barPath(width: number, height: number): string {
  const cx = width / 2;
  const left = cx - NOTCH_HALF;
  const right = cx + NOTCH_HALF;
  const top = 14;

  return [
    `M 0 ${top}`,
    `L ${left - 18} ${top}`,
    `C ${left - 6} ${top} ${left - 4} 0 ${left + 8} 0`,
    `C ${cx - 20} 0 ${cx - 20} 28 ${cx} 28`,
    `C ${cx + 20} 28 ${cx + 20} 0 ${right - 8} 0`,
    `C ${right + 4} 0 ${right + 6} ${top} ${right + 18} ${top}`,
    `L ${width} ${top}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    'Z',
  ].join(' ');
}

function TabItem({
  label,
  Icon,
  focused,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  label: string;
  Icon: LucideIcon;
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
}) {
  const c = useE237Colors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tint = focused ? c.accent : c.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        haptic('selection');
        scale.value = withSpring(0.88, { damping: 14, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 260 });
      }}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabInner, animatedStyle]}>
        {/* Point d'état : sans libellé, c'est lui qui dit « vous êtes ici ».
            Toujours présent, transparent au repos — la rangée d'icônes ne
            saute donc pas d'un pixel au changement d'onglet. */}
        <View
          style={[
            styles.dot,
            { backgroundColor: focused ? c.accent : 'transparent' },
          ]}
        />
        <Icon color={tint} size={24} strokeWidth={focused ? 2.4 : 2} />
      </Animated.View>
    </Pressable>
  );
}

function DuelsFab({
  focused,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const c = useE237Colors();
  const scale = useSharedValue(1);
  const glow = useSharedValue(focused ? 1 : 0.55);

  useEffect(() => {
    glow.value = withSpring(focused ? 1 : 0.55, { damping: 14 });
  }, [focused, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.35 + glow.value * 0.45,
  }));

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.fabSlot} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.fabHalo,
          { shadowColor: c.accent, backgroundColor: `${c.accent}33` },
          animatedStyle,
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel="Duels"
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => {
          haptic('medium');
          scale.value = withSpring(0.92, { damping: 14, stiffness: 340 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 260 });
        }}
        style={styles.fabPressable}
      >
        <Animated.View style={[styles.fab, fabStyle]}>
          <Svg width={FAB_SIZE} height={FAB_SIZE} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="duelsFabGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={c.accent} />
                <Stop offset="1" stopColor={c.cyan} />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width={FAB_SIZE}
              height={FAB_SIZE}
              rx={FAB_SIZE / 2}
              fill="url(#duelsFabGrad)"
            />
          </Svg>
          <Swords color={c.onAccent} size={28} strokeWidth={2.4} />
        </Animated.View>
      </Pressable>

      {/* Le seul libellé de la barre, SOUS le cercle : le FAB est l'action
          principale du produit, elle se nomme. Le pictogramme garde tout le
          disque pour lui. */}
      <Txt
        variant="label"
        size={font.size.xs - 1}
        color={focused ? c.accent : c.textSecondary}
        numberOfLines={1}
        style={styles.fabLabel}
      >
        Duels
      </Txt>
    </View>
  );
}

export function E237TabBar({
  state,
  descriptors,
  navigation,
  safeAreaBottom = 0,
}: E237TabBarProps) {
  const c = useE237Colors();
  const { width: screenWidth } = useWindowDimensions();
  const barTotalHeight = BAR_HEIGHT + safeAreaBottom;
  const d = barPath(screenWidth, barTotalHeight);

  return (
    <View
      style={[
        styles.root,
        {
          height: barTotalHeight + 22,
          paddingBottom: safeAreaBottom,
        },
      ]}
    >
      {/* Voile : le contenu qui défile se fond dans la barre au lieu de la heurter. */}
      <Svg
        width={screenWidth}
        height={barTotalHeight + 22}
        style={styles.scrim}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="e237BarScrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.bg} stopOpacity={0} />
            <Stop offset="1" stopColor={c.bg} stopOpacity={0.92} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={screenWidth}
          height={barTotalHeight + 22}
          fill="url(#e237BarScrim)"
        />
      </Svg>

      <Svg
        width={screenWidth}
        height={barTotalHeight}
        style={styles.barSvg}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="e237BarGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.surfaceRaised} />
            <Stop offset="1" stopColor={c.surface} />
          </LinearGradient>
          {/* Filet lumineux : neutre sur les bords, teinté accent sous le FAB. */}
          <LinearGradient id="e237BarEdge" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={c.border} />
            <Stop offset="0.34" stopColor={c.border} />
            <Stop offset="0.5" stopColor={c.accent} />
            <Stop offset="0.66" stopColor={c.border} />
            <Stop offset="1" stopColor={c.border} />
          </LinearGradient>
        </Defs>
        <Path d={d} fill="url(#e237BarGrad)" />
        <Path d={d} fill="none" stroke="url(#e237BarEdge)" strokeWidth={1.5} />
      </Svg>

      <View style={[styles.row, { height: BAR_HEIGHT }]}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const { options } = descriptors[route.key];
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            }) as { defaultPrevented?: boolean } | undefined;
            if (!focused && !event?.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          if (meta.fab) {
            return (
              <DuelsFab
                key={route.key}
                focused={focused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          }

          return (
            <TabItem
              key={route.key}
              label={options.title ?? meta.label}
              Icon={meta.Icon}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  barSvg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: spacing['2'],
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['1'],
  },
  tabInner: {
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -30,
  },
  fabHalo: {
    position: 'absolute',
    top: -6,
    width: FAB_SIZE + 28,
    height: FAB_SIZE + 28,
    borderRadius: radius.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  fabPressable: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 1,
  },
  fabLabel: {
    letterSpacing: 0.4,
    marginTop: spacing['1-5'],
  },
});
