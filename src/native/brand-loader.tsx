/**
 * L'écran de chargement de G-HUB (natif) — jumeau de `../web/brand-loader`.
 *
 * Retour du porteur (08/10/2026) : un motion design du logo plutôt qu'un
 * spinner et « Chargement… ». Le signe se TRACE (cadre hexagonal au trait,
 * puis le « G » et le « H » qui s'y posent, une respiration), sur la partition
 * partagée de `lib/brand-motion.ts`, avec les tracés de `lib/brand-mark.ts` et
 * eux seuls.
 *
 * Une seule horloge Reanimated (0 → 1 en boucle) anime quatre `Path` par
 * leurs props (pointillé, opacités) : tout tourne sur le fil UI, rien ne
 * repasse par le pont JS — un Android d'entrée de gamme garde ses 60 i/s
 * pendant que l'application démarre.
 *
 * « Réduire les animations » : le signe complet, immobile. Le lecteur
 * d'écran entend « Chargement de G-HUB… ».
 */
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useDsT } from '../i18n';
import {
  MARK_CROSSBAR_SHADE_PATH,
  MARK_LETTER_G_PATH,
  MARK_LETTER_H_PATH,
  MARK_RING_PATH,
  MARK_VIEW_BOX,
} from '../lib/brand-mark';
import { BRAND_LOADER_CYCLE_MS, BRAND_LOADER_TIMELINE as T, polylinePathLength } from '../lib/brand-motion';
import { useE237Colors } from './core';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Longueur du cadre (contours extérieur + intérieur) : `react-native-svg` n'a pas `pathLength`. */
const RING_LENGTH = polylinePathLength(MARK_RING_PATH);

export interface BrandLoaderProps {
  /** Côté du signe, en points (défaut 72). */
  size?: number;
  /** Ce que lit le lecteur d'écran ; défaut « Chargement de G-HUB… ». */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function BrandLoader({ size = 72, label, style }: BrandLoaderProps) {
  const c = useE237Colors();
  const t = useDsT();
  const reduced = useReducedMotion();
  const clock = useSharedValue(reduced ? 0.7 : 0);

  useEffect(() => {
    if (reduced) {
      cancelAnimation(clock);
      // 0,7 : l'instant du cycle où le signe est complet et immobile.
      clock.value = 0.7;
      return;
    }
    clock.value = 0;
    clock.value = withRepeat(
      withTiming(1, { duration: BRAND_LOADER_CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(clock);
  }, [clock, reduced]);

  const ringProps = useAnimatedProps(() => {
    const v = clock.value;
    return {
      strokeDashoffset: interpolate(v, [...T.ringDraw], [RING_LENGTH, 0], 'clamp'),
      strokeOpacity: interpolate(v, [0, T.ringDraw[1], T.ringFill[1]], [1, 1, 0], 'clamp'),
      fillOpacity: interpolate(
        v,
        [T.ringFill[0], T.ringFill[1], T.fadeOut[0], T.fadeOut[1]],
        [0, 1, 1, 0],
        'clamp',
      ),
    };
  });
  const gProps = useAnimatedProps(() => ({
    opacity: interpolate(
      clock.value,
      [T.letterG[0], T.letterG[1], T.fadeOut[0], T.fadeOut[1]],
      [0, 1, 1, 0],
      'clamp',
    ),
  }));
  const hProps = useAnimatedProps(() => ({
    opacity: interpolate(
      clock.value,
      [T.letterH[0], T.letterH[1], T.fadeOut[0], T.fadeOut[1]],
      [0, 1, 1, 0],
      'clamp',
    ),
  }));
  const shadeProps = useAnimatedProps(() => ({
    opacity: interpolate(
      clock.value,
      [T.shade[0], T.shade[1], T.fadeOut[0], T.fadeOut[1]],
      [0, 1, 1, 0],
      'clamp',
    ),
  }));
  // Une respiration du signe complet (échelle), sur la même horloge.
  const breathe = useAnimatedStyle(() => {
    const [from, to] = T.breathe;
    const mid = (from + to) / 2;
    return {
      transform: [{ scale: interpolate(clock.value, [from, mid, to], [1, 1.06, 1], 'clamp') }],
    };
  });

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? t('ui.loader.label')}
      style={[{ width: size, height: size }, style]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, breathe]}>
        <Svg viewBox={MARK_VIEW_BOX} width={size} height={size}>
          <AnimatedPath
            d={MARK_RING_PATH}
            fill={c.accent}
            stroke={c.accent}
            strokeWidth={12}
            strokeDasharray={[RING_LENGTH, RING_LENGTH]}
            animatedProps={ringProps}
          />
          <AnimatedPath d={MARK_LETTER_G_PATH} fill={c.textPrimary} animatedProps={gProps} />
          <AnimatedPath d={MARK_LETTER_H_PATH} fill={c.accent} animatedProps={hProps} />
          <AnimatedPath d={MARK_CROSSBAR_SHADE_PATH} fill={c.accentHover} animatedProps={shadeProps} />
        </Svg>
      </Animated.View>
    </View>
  );
}

export interface PageLoaderProps {
  /** Ce que lit le lecteur d'écran. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Le chargement d'un ÉCRAN entier (démarrage, garde de session, rappel
 * d'authentification) : le signe animé, centré sur le fond du thème.
 */
export function PageLoader({ label, style }: PageLoaderProps) {
  const c = useE237Colors();
  return (
    <View style={[styles.page, { backgroundColor: c.bg }, style]}>
      <BrandLoader size={88} label={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
