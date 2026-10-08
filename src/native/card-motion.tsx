/**
 * Mouvements de la carte joueur : inclinaison 3D qui suit le doigt, reflet
 * holographique, retournement recto/verso et éclat de progression.
 *
 * TOUT tourne sur le fil UI (Reanimated + Gesture Handler) : un toucher écrit
 * des valeurs partagées, des styles animés les lisent. Aucun `setState` par
 * image — le seul état React est « la carte est-elle retournée », qui change
 * une fois par geste et sert l'accessibilité.
 *
 * Trois règles tiennent ce fichier :
 *
 *  1. **Opt-in.** Sans `interactive` ni `flippable`, aucun détecteur de geste
 *     n'est monté : une carte posée dans le paquet de duel (qui a son propre
 *     glisser) ou dans une liste ne change pas de comportement.
 *  2. **Le geste d'inclinaison ne s'active jamais** (`Gesture.Manual`) : il lit
 *     les touchers sans les revendiquer, donc un carrousel horizontal ou une
 *     page verticale continuent de défiler sous le doigt — et la carte revient
 *     à plat dès qu'ils prennent la main.
 *  3. **« Réduire les animations » est respecté** (`useReducedMotion`) : pas
 *     d'inclinaison ni de reflet, retournement en fondu, note posée sans
 *     compteur.
 *
 * Couleurs : uniquement celles du skin (`ink`, `accent`, `glow`, liseré) —
 * jamais une teinte écrite ici.
 */
import { useEffect, useId, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { odometerDigits, odometerOffset } from '../lib/game-cards';
import { CARD_BASE_WIDTH, CARD_REF_HEIGHT, cardShape } from '../skins/geometry';
import { stopColor, type SkinSpec } from '../skins/spec';

import { haptic } from './haptics';
import { Txt } from './text';

/** Inclinaison maximale, en degrés, quand le doigt est au bord de la carte. */
const MAX_TILT = 11;
/** Retour à plat : amorti, sans rebond qui ferait « gélatine ». */
const REST_SPRING = { damping: 16, stiffness: 170, mass: 0.6 };
/** Durée du retournement (fondu seul en mouvement réduit). */
const FLIP_MS = 520;
const FADE_MS = 220;

/**
 * La silhouette entière (liseré compris) vient de la FORME du skin
 * (`cardShape(spec.shape).framePath`), au repère du tracé de référence : le
 * reflet et l'éclat épousent un hexagone ou un ticket comme le bouclier.
 */
const VIEWBOX = `0 0 ${CARD_BASE_WIDTH} ${CARD_REF_HEIGHT.toFixed(2)}`;

/**
 * Bandes de reflet : cinq positions fixes le long de la diagonale, dont on
 * fait varier l'OPACITÉ. Deux voisines se partagent la lumière en fondu
 * linéaire, ce qui se lit comme une bande qui glisse — sans jamais animer une
 * propriété SVG (mal supporté sur le web) ni sortir du bouclier : chaque bande
 * est découpée à la forme, alors qu'une View translatée peindrait les crans
 * transparents des coins.
 */
const BAND_CENTERS = [0.1, 0.3, 0.5, 0.7, 0.9] as const;
const BAND_STEP = 0.2;

function clamp1(n: number): number {
  'worklet';
  return Math.max(-1, Math.min(1, n));
}

function HoloBand({
  center,
  id,
  spec,
  tiltX,
  tiltY,
  intensity,
}: {
  center: number;
  id: string;
  spec: SkinSpec;
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
  intensity: SharedValue<number>;
}) {
  const glow = spec.glow?.color ?? stopColor(spec.frame, 0);
  const silhouette = cardShape(spec.shape).framePath;
  const style = useAnimatedStyle(() => {
    /* Position du reflet le long de la diagonale haut-gauche → bas-droite. */
    const sweep = 0.5 + 0.25 * (tiltX.value + tiltY.value);
    const weight = Math.max(0, 1 - Math.abs(sweep - center) / BAND_STEP);
    return { opacity: weight * intensity.value };
  });
  const at = (d: number) => String(Math.min(1, Math.max(0, center + d)));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg viewBox={VIEWBOX} width="100%" height="100%">
        <Defs>
          <LinearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset={at(-0.22)} stopColor={spec.accent} stopOpacity={0} />
            <Stop offset={at(-0.09)} stopColor={spec.accent} stopOpacity={0.2} />
            <Stop offset={at(0)} stopColor={spec.ink} stopOpacity={0.34} />
            <Stop offset={at(0.09)} stopColor={glow} stopOpacity={0.2} />
            <Stop offset={at(0.22)} stopColor={glow} stopOpacity={0} />
          </LinearGradient>
          <ClipPath id={`${id}c`}>
            <Path d={silhouette} />
          </ClipPath>
        </Defs>
        <Rect
          width={CARD_BASE_WIDTH}
          height={CARD_REF_HEIGHT}
          fill={`url(#${id}g)`}
          clipPath={`url(#${id}c)`}
        />
      </Svg>
    </Animated.View>
  );
}

/** Liseré lumineux qui s'élargit et s'éteint quand la note monte. */
function RiseHalo({ spec, burst }: { spec: SkinSpec; burst: SharedValue<number> }) {
  const color = spec.glow?.color ?? spec.accent;
  const style = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 1 + (1 - burst.value) * 0.06 }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg viewBox={VIEWBOX} width="100%" height="100%">
        <Path
          d={cardShape(spec.shape).framePath}
          fill={color}
          fillOpacity={0.12}
          stroke={color}
          strokeOpacity={0.9}
          strokeWidth={5}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}

export interface CardStageProps {
  spec: SkinSpec;
  /** Inclinaison 3D + reflet holographique sous le doigt (ou la souris). */
  interactive?: boolean;
  /** Retournement au toucher ; sans `back`, rien ne se retourne. */
  flippable?: boolean;
  front: ReactNode;
  back?: ReactNode;
  /** S'incrémente à chaque progression de la note : déclenche l'éclat. */
  riseKey?: number;
  flipLabel: string;
  flipHint: string;
}

/**
 * Scène d'une carte : porte l'inclinaison, le reflet, l'éclat, et les deux
 * faces superposées. La face avant reste dans le flux (elle donne la taille),
 * le verso est posé par-dessus en absolu et n'est monté qu'au premier
 * retournement — une carte qu'on ne retourne jamais ne paie pas son verso.
 */
export function CardStage({
  spec,
  interactive = false,
  flippable = false,
  front,
  back,
  riseKey = 0,
  flipLabel,
  flipHint,
}: CardStageProps) {
  const reduced = useReducedMotion();
  const uid = `cs${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const canFlip = flippable && back != null;
  const canTilt = interactive && !reduced;

  const [flipped, setFlipped] = useState(false);
  const [backMounted, setBackMounted] = useState(false);

  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const intensity = useSharedValue(0);
  const press = useSharedValue(1);
  const pulse = useSharedValue(1);
  const burst = useSharedValue(0);
  const flip = useSharedValue(0);

  /* Éclat de progression : la carte « respire » une fois, le liseré flashe.
     En mouvement réduit, seul le liseré s'allume puis s'éteint, sur place. */
  useEffect(() => {
    if (riseKey === 0) return;
    burst.value = withSequence(
      withTiming(1, { duration: reduced ? 120 : 180 }),
      withDelay(reduced ? 500 : 260, withTiming(0, { duration: reduced ? 300 : 700 })),
    );
    if (!reduced) {
      pulse.value = withSequence(
        withTiming(1.045, { duration: 180, easing: Easing.out(Easing.quad) }),
        withSpring(1, REST_SPRING),
      );
    }
  }, [riseKey, reduced, burst, pulse]);

  function toggle() {
    const next = !flipped;
    setFlipped(next);
    setBackMounted(true);
    flip.value = withTiming(next ? 1 : 0, {
      duration: reduced ? FADE_MS : FLIP_MS,
      easing: Easing.inOut(Easing.cubic),
    });
    haptic('selection');
  }

  const aim = (x: number, y: number) => {
    'worklet';
    if (width.value <= 0 || height.value <= 0) return;
    const nx = clamp1((x / width.value) * 2 - 1);
    const ny = clamp1((y / height.value) * 2 - 1);
    tiltX.value = withTiming(nx, { duration: 90 });
    tiltY.value = withTiming(ny, { duration: 90 });
    intensity.value = withTiming(1, { duration: 160 });
  };
  const rest = () => {
    'worklet';
    tiltX.value = withSpring(0, REST_SPRING);
    tiltY.value = withSpring(0, REST_SPRING);
    intensity.value = withTiming(0, { duration: 420 });
    press.value = withSpring(1, REST_SPRING);
  };

  const gestures: GestureType[] = [];
  if (canTilt) {
    gestures.push(
      Gesture.Manual()
        .onTouchesDown((e) => {
          const t = e.allTouches[0];
          if (!t) return;
          press.value = withTiming(1.02, { duration: 120 });
          aim(t.x, t.y);
        })
        .onTouchesMove((e) => {
          const t = e.allTouches[0];
          if (t) aim(t.x, t.y);
        })
        .onTouchesUp(() => rest())
        .onTouchesCancelled(() => rest()),
      Gesture.Hover()
        .onUpdate((e) => aim(e.x, e.y))
        .onFinalize(() => rest()),
    );
  }
  if (canFlip) {
    gestures.push(
      Gesture.Tap()
        .maxDuration(450)
        .onEnd((_e, success) => {
          if (success) runOnJS(toggle)();
        }),
    );
  }

  const stageStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${-tiltY.value * MAX_TILT}deg` },
      { rotateY: `${tiltX.value * MAX_TILT}deg` },
      { scale: press.value * pulse.value },
    ],
  }));

  const frontStyle = useAnimatedStyle(() => {
    const p = flip.value;
    if (reduced) return { opacity: 1 - p };
    return {
      opacity: p < 0.5 ? 1 : 0,
      transform: [{ perspective: 1200 }, { rotateY: `${p * 180}deg` }],
    };
  });
  const backStyle = useAnimatedStyle(() => {
    const p = flip.value;
    if (reduced) return { opacity: p };
    return {
      opacity: p >= 0.5 ? 1 : 0,
      transform: [{ perspective: 1200 }, { rotateY: `${(p - 1) * 180}deg` }],
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    width.value = e.nativeEvent.layout.width;
    height.value = e.nativeEvent.layout.height;
  };

  const stage = (
    <Animated.View
      onLayout={onLayout}
      style={[styles.stage, stageStyle]}
      accessible={canFlip}
      accessibilityRole={canFlip ? 'button' : undefined}
      accessibilityLabel={canFlip ? flipLabel : undefined}
      accessibilityHint={canFlip ? flipHint : undefined}
      accessibilityActions={canFlip ? [{ name: 'activate' }] : undefined}
      onAccessibilityAction={canFlip ? toggle : undefined}>
      <Animated.View
        style={canFlip ? frontStyle : undefined}
        importantForAccessibility={flipped ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={flipped}>
        {front}
      </Animated.View>
      {canFlip && backMounted ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, backStyle]}
          importantForAccessibility={flipped ? 'auto' : 'no-hide-descendants'}
          accessibilityElementsHidden={!flipped}>
          {back}
        </Animated.View>
      ) : null}
      {canTilt
        ? BAND_CENTERS.map((center, i) => (
            <HoloBand
              key={center}
              center={center}
              id={`${uid}h${i}`}
              spec={spec}
              tiltX={tiltX}
              tiltY={tiltY}
              intensity={intensity}
            />
          ))
        : null}
      {riseKey > 0 ? <RiseHalo spec={spec} burst={burst} /> : null}
    </Animated.View>
  );

  if (!gestures.length) return stage;
  return (
    <GestureDetector
      gesture={Gesture.Simultaneous(...gestures)}
      touchAction="manipulation">
      {stage}
    </GestureDetector>
  );
}

/* ========================================================================== */
/* Compteur de note                                                           */
/* ========================================================================== */

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;

/** Une colonne de l'odomètre : 0→9 puis 0, translatée sur le fil UI. */
function OdometerColumn({
  place,
  value,
  lineHeight,
  textStyle,
  color,
}: {
  place: number;
  value: SharedValue<number>;
  lineHeight: number;
  textStyle: object;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    /* Une colonne de tête (les centaines de 99 → 101) n'apparaît qu'en
       franchissant son seuil : jamais de « 099 » affiché. */
    const threshold = Math.pow(10, place) - 1;
    const visible = place === 0 ? 1 : Math.min(1, Math.max(0, value.value - threshold));
    return {
      opacity: visible,
      transform: [{ translateY: -odometerOffset(value.value, place) * lineHeight }],
    };
  });
  return (
    <View style={{ height: lineHeight, overflow: 'hidden' }}>
      <Animated.View style={style}>
        {DIGITS.map((d, i) => (
          <Txt
            key={i}
            color={color}
            style={[textStyle, { height: lineHeight, lineHeight }]}>
            {d}
          </Txt>
        ))}
      </Animated.View>
    </View>
  );
}

export interface RisingNumberProps {
  value: number;
  /** Style typographique de la valeur (famille, corps, approche). */
  textStyle: object;
  /** Interligne = hauteur d'une case de l'odomètre. */
  lineHeight: number;
  color: string;
  /** Rattrapage vertical (l'interligne de repos peut être plus serré). */
  style?: object;
}

/**
 * Note qui MONTE en roulant, comme un compteur mécanique, quand `value`
 * augmente — après un duel validé, l'écran recharge la carte et la nouvelle
 * note arrive par la prop. Une baisse, un premier rendu ou le mouvement réduit
 * posent la valeur sans animation.
 *
 * Au repos : un seul texte. L'odomètre (onze chiffres par colonne) n'existe
 * que le temps de la montée — deux changements d'état par progression, aucun
 * par image.
 */
export function RisingNumber({ value, textStyle, lineHeight, color, style }: RisingNumberProps) {
  const reduced = useReducedMotion();
  const shown = useSharedValue(value);
  const [rolling, setRolling] = useState<{ from: number; to: number } | null>(null);
  const [prev, setPrev] = useState(value);

  /* Ajustement pendant le rendu (et non dans un effet) : on sait au même
     passage si la note a monté, sans rendu intermédiaire à l'ancienne valeur. */
  if (value !== prev) {
    setPrev(value);
    if (value > prev && !reduced) setRolling({ from: prev, to: value });
    else if (rolling) setRolling(null);
  }

  useEffect(() => {
    if (!rolling) {
      shown.value = value;
      return;
    }
    const steps = rolling.to - rolling.from;
    shown.value = rolling.from;
    shown.value = withTiming(
      rolling.to,
      { duration: Math.min(1400, 550 + steps * 110), easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setRolling)(null);
      },
    );
  }, [rolling, value, shown]);

  if (!rolling) {
    return (
      <View style={style}>
        <Txt
          color={color}
          numberOfLines={1}
          style={[textStyle, { height: lineHeight, lineHeight }]}>
          {value}
        </Txt>
      </View>
    );
  }

  const count = odometerDigits(rolling.from, rolling.to);
  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {Array.from({ length: count }, (_, i) => count - 1 - i).map((place) => (
        <OdometerColumn
          key={place}
          place={place}
          value={shown}
          lineHeight={lineHeight}
          textStyle={textStyle}
          color={color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: '100%' },
});
