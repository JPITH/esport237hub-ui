/**
 * Chrome des cartes joueur façon FUT — MÊMES skins que le web
 * (classes `.pcard--*` de `apps/web/src/app/globals.css`, mêmes hex).
 * Toute retouche de palette se fait DES DEUX CÔTÉS.
 *
 * Rendu react-native-svg (déjà en dépendance) mesuré par onLayout :
 * fond en dégradés (linéaire + radiaux), rayures décoratives, bordure,
 * liseré intérieur. Les skins PREMIUM (vendables) ajoutent un balayage
 * « foil » animé — une seule View Reanimated en transform : quasi gratuit.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Line,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

export type CardSkin =
  | 'gold'
  | 'signature'
  | 'emerald'
  | 'champion'
  | 'global'
  | 'indomptable'
  | 'heritage237'
  | 'nuit-douala';

export const PREMIUM_SKINS: CardSkin[] = ['indomptable', 'heritage237', 'nuit-douala'];

interface RadialSpec {
  color: string;
  opacity: number;
  /** Centre en fraction de la largeur/hauteur (peut sortir de [0,1]). */
  cx: number;
  cy: number;
  r: number;
}

interface StripeSpec {
  color: string;
  opacity: number;
  angle: 'diagonal' | 'chevron' | 'scanline';
  color2?: string;
  opacity2?: number;
}

export interface SkinSpec {
  label: string;
  /** Texte principal / ligne de séparation / accent (gros chiffre victoires). */
  ink: string;
  line: string;
  accent: string;
  /** Dégradé de fond (haut → bas) et halos radiaux par-dessus. */
  linear: [string, string, string];
  radials: RadialSpec[];
  stripes?: StripeSpec;
  border: string;
  inner: string;
  /** Couleur du balayage foil (skins premium). */
  sheen?: string;
}

export const CARD_SKINS: Record<CardSkin, SkinSpec> = {
  /* Or — défaut de la carte de jeu (`.pcard` sans modifieur, côté web). */
  gold: {
    label: 'Or',
    ink: '#0b1220',
    line: 'rgba(11,18,32,0.16)',
    accent: '#b45309',
    linear: ['#fbbf24', '#eab308', '#fde68a'],
    radials: [{ color: '#fef3c7', opacity: 1, cx: 0.5, cy: -0.1, r: 0.9 }],
    border: '#a5810a',
    inner: 'rgba(255,255,255,0.35)',
  },
  signature: {
    label: 'Signature',
    ink: '#eaf2ff',
    line: 'rgba(255,255,255,0.14)',
    accent: '#22c55e',
    linear: ['#163055', '#0b1a30', '#0a1526'],
    radials: [
      { color: '#22d3ee', opacity: 0.35, cx: 0.78, cy: -0.06, r: 0.75 },
      { color: '#22c55e', opacity: 0.28, cx: 0.1, cy: 1.1, r: 0.7 },
    ],
    border: 'rgba(250,204,21,0.5)',
    inner: 'rgba(250,204,21,0.35)',
  },
  emerald: {
    label: 'Émeraude',
    ink: '#eafff3',
    line: 'rgba(255,255,255,0.14)',
    accent: '#4ade80',
    linear: ['#0f5f3c', '#0a4a2e', '#07301f'],
    radials: [{ color: '#4ade80', opacity: 0.3, cx: 0.5, cy: -0.1, r: 0.85 }],
    border: 'rgba(74,222,128,0.5)',
    inner: 'rgba(255,255,255,0.18)',
  },
  champion: {
    label: 'Champion',
    ink: '#2a1e00',
    line: 'rgba(42,30,0,0.22)',
    accent: '#7a5200',
    linear: ['#f6cc4b', '#c9930f', '#7a5200'],
    radials: [{ color: '#fff3c4', opacity: 1, cx: 0.5, cy: -0.12, r: 0.8 }],
    border: '#ffd970',
    inner: 'rgba(255,255,255,0.55)',
  },
  /* Carte globale (identité tous jeux) — bleu nuit + or prestige. */
  global: {
    label: 'Globale',
    ink: '#fff7e6',
    line: 'rgba(255,255,255,0.16)',
    accent: '#fde68a',
    linear: ['#1b2c4d', '#0c1930', '#0a1424'],
    radials: [
      { color: '#facc15', opacity: 0.3, cx: 0.78, cy: -0.06, r: 0.75 },
      { color: '#22d3ee', opacity: 0.22, cx: 0.12, cy: 1.12, r: 0.65 },
    ],
    border: 'rgba(250,204,21,0.6)',
    inner: 'rgba(250,204,21,0.4)',
  },
  /* --- Skins PREMIUM vendables --- */
  indomptable: {
    label: 'Indomptable',
    ink: '#f7ecca',
    line: 'rgba(240,205,110,0.22)',
    accent: '#f0cd6e',
    linear: ['#241905', '#150e03', '#2b1f08'],
    radials: [{ color: '#3b2a0a', opacity: 1, cx: 0.5, cy: -0.1, r: 0.9 }],
    stripes: { color: '#f0cd6e', opacity: 0.05, angle: 'diagonal' },
    border: 'rgba(240,205,110,0.55)',
    inner: 'rgba(240,205,110,0.38)',
    sheen: '#f0cd6e',
  },
  heritage237: {
    label: '237 Héritage',
    ink: '#eef7e9',
    line: 'rgba(252,209,22,0.22)',
    accent: '#fcd116',
    linear: ['#0b2e1b', '#071f12', '#0e3520'],
    radials: [{ color: '#123b24', opacity: 1, cx: 0.5, cy: 1.1, r: 0.9 }],
    stripes: {
      color: '#fcd116',
      opacity: 0.055,
      angle: 'chevron',
      color2: '#ce1126',
      opacity2: 0.05,
    },
    border: 'rgba(252,209,22,0.55)',
    inner: 'rgba(252,209,22,0.32)',
    sheen: '#fcd116',
  },
  'nuit-douala': {
    label: 'Nuit de Douala',
    ink: '#e4f6ff',
    line: 'rgba(53,225,225,0.25)',
    accent: '#35e1e1',
    linear: ['#071226', '#050b18', '#0b1e33'],
    radials: [{ color: '#c13bff', opacity: 0.16, cx: 0.85, cy: -0.1, r: 0.7 }],
    stripes: { color: '#35e1e1', opacity: 0.045, angle: 'scanline' },
    border: 'rgba(53,225,225,0.55)',
    inner: 'rgba(53,225,225,0.3)',
    sheen: '#35e1e1',
  },
};

const RADIUS = 20;
const INNER_INSET = 6;

function Stripes({ spec, w, h }: { spec: StripeSpec; w: number; h: number }) {
  const lines: ReactNode[] = [];
  if (spec.angle === 'scanline') {
    for (let y = 6; y < h; y += 6) {
      lines.push(
        <Line key={y} x1={0} y1={y} x2={w} y2={y} stroke={spec.color} strokeOpacity={spec.opacity} />,
      );
    }
  } else if (spec.angle === 'diagonal') {
    for (let x = -h; x < w + h; x += 16) {
      lines.push(
        <Line
          key={x}
          x1={x}
          y1={h}
          x2={x + h * 0.7}
          y2={0}
          stroke={spec.color}
          strokeOpacity={spec.opacity}
          strokeWidth={2}
        />,
      );
    }
  } else {
    for (let x = -h; x < w + h; x += 38) {
      lines.push(
        <Line
          key={`a${x}`}
          x1={x}
          y1={h}
          x2={x + h}
          y2={0}
          stroke={spec.color}
          strokeOpacity={spec.opacity}
          strokeWidth={2}
        />,
        <Line
          key={`b${x}`}
          x1={x + h}
          y1={h}
          x2={x}
          y2={0}
          stroke={spec.color2 ?? spec.color}
          strokeOpacity={spec.opacity2 ?? spec.opacity}
          strokeWidth={2}
        />,
      );
    }
  }
  return <>{lines}</>;
}

/** Balayage « foil » périodique (premium) — transform only. */
function Sheen({ color, w, h }: { color: string; w: number; h: number }) {
  const bandW = w * 0.36;
  const x = useSharedValue(-bandW * 1.6);
  useEffect(() => {
    x.value = -bandW * 1.6;
    x.value = withRepeat(
      withSequence(
        withDelay(
          1400,
          withTiming(w + bandW, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
        ),
        withTiming(-bandW * 1.6, { duration: 0 }),
      ),
      -1,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: -h * 0.25, height: h * 1.5, width: bandW }, style]}>
      <Svg width="100%" height="100%" style={{ transform: [{ skewX: '-18deg' }] }}>
        <Defs>
          <LinearGradient id="pc-sheen" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={0} />
            <Stop offset="0.5" stopColor={color} stopOpacity={0.16} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#pc-sheen)" />
      </Svg>
    </Animated.View>
  );
}

/**
 * Enveloppe visuelle d'une carte : ratio 63/88 (comme le web), fond en
 * dégradés, rayures, bordure et liseré intérieur ; foil animé si premium.
 */
export function CardChrome({
  skin,
  children,
}: {
  skin: CardSkin;
  children: ReactNode;
}) {
  const spec = CARD_SKINS[skin];
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  return (
    <View
      onLayout={(e) =>
        setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
      style={styles.card}>
      {size ? (
        <Svg
          width={size.w}
          height={size.h}
          style={StyleSheet.absoluteFill}
          pointerEvents="none">
          <Defs>
            <LinearGradient id={`bg-${skin}`} x1="0" y1="0" x2="0.2" y2="1">
              <Stop offset="0" stopColor={spec.linear[0]} />
              <Stop offset="0.55" stopColor={spec.linear[1]} />
              <Stop offset="1" stopColor={spec.linear[2]} />
            </LinearGradient>
            {spec.radials.map((r, i) => (
              <RadialGradient
                key={i}
                id={`rad-${skin}-${i}`}
                cx={String(r.cx)}
                cy={String(r.cy)}
                r={String(r.r)}>
                <Stop offset="0" stopColor={r.color} stopOpacity={r.opacity} />
                <Stop offset="1" stopColor={r.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          <Rect width={size.w} height={size.h} rx={RADIUS} fill={`url(#bg-${skin})`} />
          {spec.radials.map((_, i) => (
            <Rect
              key={i}
              width={size.w}
              height={size.h}
              rx={RADIUS}
              fill={`url(#rad-${skin}-${i})`}
            />
          ))}
          {spec.stripes ? <Stripes spec={spec.stripes} w={size.w} h={size.h} /> : null}
          {/* Bordure extérieure puis liseré intérieur brillant. */}
          <Rect
            x={0.5}
            y={0.5}
            width={size.w - 1}
            height={size.h - 1}
            rx={RADIUS - 0.5}
            fill="none"
            stroke={spec.border}
          />
          <Rect
            x={INNER_INSET}
            y={INNER_INSET}
            width={size.w - INNER_INSET * 2}
            height={size.h - INNER_INSET * 2}
            rx={RADIUS - INNER_INSET + 1}
            fill="none"
            stroke={spec.inner}
          />
        </Svg>
      ) : null}
      {size && spec.sheen ? <Sheen color={spec.sheen} w={size.w} h={size.h} /> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    /* Ratio de carte fixe — identique au web (63/88). */
    aspectRatio: 63 / 88,
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
});
