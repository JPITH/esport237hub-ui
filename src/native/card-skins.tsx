/**
 * Chrome des cartes joueur FUT « Founders » — MÊMES skins que le web
 * (classes `.pcard--*` de `packages/ui/src/theme/components.css`, mêmes hex).
 * Toute retouche de palette se fait DES DEUX CÔTÉS.
 *
 * Rendu react-native-svg mesuré par onLayout : bouclier crénelé en polygones
 * (liseré dégradé + surface), halos radiaux, rayures décoratives clippées.
 * Les skins PREMIUM (vendables) ajoutent un balayage « foil » animé — une
 * seule View Reanimated en transform : quasi gratuit.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
  ClipPath,
  Defs,
  G,
  Line,
  LinearGradient,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

/**
 * Familles Inter chargées par les apps (expo-font / @expo-google-fonts/inter).
 * Le fontWeight est encodé dans le nom du fichier — ne pas cumuler avec
 * `fontWeight` (conflit Android).
 */
export const CARD_FONTS = {
  black: 'Inter_900Black',
  extraBold: 'Inter_800ExtraBold',
  bold: 'Inter_700Bold',
  semiBold: 'Inter_600SemiBold',
} as const;

/**
 * Échelle de la carte : 1 = largeur de référence 300 (celle pour laquelle les
 * tailles fixes ont été dessinées). Fournie par CardChrome après mesure,
 * consommée par les styles des cartes (équivalent natif des `cqw` du web).
 */
const CardScaleContext = createContext(1);
export function useCardScale(): number {
  return useContext(CardScaleContext);
}
const BASE_WIDTH = 300;
function cardScale(width: number): number {
  return Math.min(1.2, Math.max(0.5, width / BASE_WIDTH));
}

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
  /** Texte principal / ligne de séparation / accent. */
  ink: string;
  line: string;
  accent: string;
  /** Dégradé du liseré extérieur (haut clair → bas sombre). */
  frame: [string, string, string];
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
  /* Or — défaut de la carte sans modifieur côté web. */
  gold: {
    label: 'Or',
    ink: '#241702',
    line: 'rgba(36,23,2,0.22)',
    accent: '#8a5a12',
    frame: ['#fff0a8', '#c89119', '#4a3608'],
    linear: ['#e9bc3f', '#c89a28', '#6f5a1c'],
    radials: [{ color: '#fff0a8', opacity: 0.9, cx: 0.72, cy: 0.18, r: 0.6 }],
    border: '#a5810a',
    inner: 'rgba(255,255,255,0.3)',
  },
  /* Signature — VERT (couleur du hub + vert FC 27), défaut des cartes de jeu. */
  signature: {
    label: 'Signature',
    ink: '#eafff3',
    line: 'rgba(255,255,255,0.16)',
    accent: '#4ade80',
    frame: ['#b9f7d0', '#1d9e58', '#052716'],
    linear: ['#0e4f2c', '#0a3d22', '#052a16'],
    radials: [{ color: '#4ade80', opacity: 0.32, cx: 0.72, cy: 0.18, r: 0.7 }],
    border: 'rgba(74,222,128,0.5)',
    inner: 'rgba(255,255,255,0.2)',
  },
  emerald: {
    label: 'Émeraude',
    ink: '#eafff3',
    line: 'rgba(255,255,255,0.16)',
    accent: '#4ade80',
    frame: ['#a9f0c8', '#16794a', '#06301d'],
    linear: ['#0f5f3c', '#0a4a2e', '#062d1c'],
    radials: [{ color: '#4ade80', opacity: 0.3, cx: 0.5, cy: -0.1, r: 0.85 }],
    border: 'rgba(74,222,128,0.5)',
    inner: 'rgba(255,255,255,0.18)',
  },
  /* Champion — n°1 du classement : or « braise » (nuit charbon + rayons d'or). */
  champion: {
    label: 'Champion',
    ink: '#f8f2df',
    line: 'rgba(244,204,101,0.25)',
    accent: '#ffd970',
    frame: ['#fff0ad', '#f4cc65', '#5a3a0a'],
    linear: ['#2b1c04', '#140c02', '#241503'],
    radials: [
      { color: '#ffcc5c', opacity: 0.5, cx: 0.68, cy: 0.04, r: 0.62 },
      { color: '#ffb020', opacity: 0.18, cx: 0.22, cy: 0.3, r: 0.6 },
    ],
    stripes: { color: '#f4cc65', opacity: 0.07, angle: 'diagonal' },
    border: '#ffd970',
    inner: 'rgba(255,255,255,0.28)',
  },
  /* Carte globale (identité tous jeux) — bleu nuit + or prestige. */
  global: {
    label: 'Globale',
    ink: '#fff7e6',
    line: 'rgba(255,255,255,0.16)',
    accent: '#fde68a',
    frame: ['#ffe9a0', '#b58a2b', '#4a3608'],
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
    frame: ['#f0cd6e', '#8a6a1f', '#241905'],
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
    frame: ['#fcd116', '#007a5e', '#032218'],
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
    frame: ['#7fe8f5', '#1b6ea8', '#071226'],
    linear: ['#071226', '#050b18', '#0b1e33'],
    radials: [{ color: '#c13bff', opacity: 0.16, cx: 0.85, cy: -0.1, r: 0.7 }],
    stripes: { color: '#35e1e1', opacity: 0.045, angle: 'scanline' },
    border: 'rgba(53,225,225,0.55)',
    inner: 'rgba(53,225,225,0.3)',
    sheen: '#35e1e1',
  },
};

/* Forme « Founders » — mêmes sommets (fractions) que le clip-path web. */
const SHAPE: Array<[number, number]> = [
  [0.16, 0.03],
  [0.38, 0.01],
  [0.5, 0.04],
  [0.62, 0.01],
  [0.84, 0.03],
  [0.96, 0.11],
  [0.98, 0.73],
  [0.9, 0.88],
  [0.5, 1],
  [0.1, 0.88],
  [0.02, 0.73],
  [0.04, 0.11],
];

/** Points SVG du bouclier, réduits vers le centre pour la surface intérieure. */
function shapePoints(w: number, h: number, inset = 0): string {
  const k = 1 - inset;
  return SHAPE.map(
    ([x, y]) => `${((0.5 + (x - 0.5) * k) * w).toFixed(2)},${((0.5 + (y - 0.5) * k) * h).toFixed(2)}`,
  ).join(' ');
}

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
      style={[
        /* Confiné à la zone droite du bouclier (évite de peindre les coins
           transparents des crans). */
        { position: 'absolute', top: h * 0.08, height: h * 0.8, width: bandW },
        style,
      ]}>
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
 * Enveloppe visuelle d'une carte : ratio 63/88 (comme le web), bouclier
 * « Founders » en polygones (liseré + surface + halos + rayures) ;
 * foil animé si premium.
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

  const outer = size ? shapePoints(size.w, size.h) : '';
  const inner = size ? shapePoints(size.w, size.h, 0.056) : '';

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
            <LinearGradient id={`frame-${skin}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={spec.frame[0]} />
              <Stop offset="0.45" stopColor={spec.frame[1]} />
              <Stop offset="1" stopColor={spec.frame[2]} />
            </LinearGradient>
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
            <ClipPath id={`clip-${skin}`}>
              <Polygon points={inner} />
            </ClipPath>
          </Defs>
          {/* Liseré extérieur puis surface intérieure. */}
          <Polygon points={outer} fill={`url(#frame-${skin})`} />
          <Polygon points={inner} fill={`url(#bg-${skin})`} />
          <G clipPath={`url(#clip-${skin})`}>
            {spec.radials.map((_, i) => (
              <Rect
                key={i}
                width={size.w}
                height={size.h}
                fill={`url(#rad-${skin}-${i})`}
              />
            ))}
            {spec.stripes ? <Stripes spec={spec.stripes} w={size.w} h={size.h} /> : null}
          </G>
          {/* Anneau intérieur brillant. */}
          <Polygon points={inner} fill="none" stroke={spec.inner} />
        </Svg>
      ) : null}
      {size && spec.sheen ? <Sheen color={spec.sheen} w={size.w} h={size.h} /> : null}
      <CardScaleContext.Provider value={size ? cardScale(size.w) : 1}>
        <View
          style={[
            styles.content,
            size
              ? {
                  paddingHorizontal: 20 * cardScale(size.w),
                  paddingTop: 24 * cardScale(size.w),
                  paddingBottom: 36 * cardScale(size.w),
                }
              : null,
          ]}>
          {children}
        </View>
      </CardScaleContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    /* Ratio de carte fixe — identique au web (63/88). */
    aspectRatio: 63 / 88,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    /* La pointe basse du bouclier mange le bas : marge plus grande. */
    paddingBottom: 36,
  },
});
