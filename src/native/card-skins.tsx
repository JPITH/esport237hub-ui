/**
 * Chrome des cartes joueur FUT « Founders » — rendu react-native-svg.
 *
 * Les palettes ne vivent PLUS ici : elles viennent de `@esport237hub/ui/skins`
 * (source de vérité unique, partagée avec le web et la base de données). Ce
 * fichier ne fait que traduire la liste de tracé (`buildSkinDraw`) en éléments
 * react-native-svg — le web traduit la MÊME liste en SVG DOM, ce qui garantit
 * un rendu identique sur web, iOS et Android.
 *
 * Un skin peut donc être une clé intégrée (`'champion'`), une clé de la
 * boutique chargée depuis l'API, ou un `SkinSpec` complet : `useSkin()` résout
 * les trois et ne rend jamais `undefined`.
 */
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
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

import {
  CARD_ASPECT,
  CARD_BASE_WIDTH,
  buildSkinDraw,
  cardScale,
  skinAnimated,
  type DrawSheen,
  type SkinDraw,
} from '../skins/geometry';
import {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  type BuiltinSkinKey,
  type SkinSpec,
} from '../skins/spec';
import { useSkin } from '../skins/context';

/**
 * Familles display chargées par l'app (Space Grotesk + Chivo — comme le web).
 * Le fontWeight est encodé dans le nom — ne pas cumuler avec `fontWeight`
 * (conflit Android). Space Grotesk max 700 ; graisses extrêmes → Chivo.
 */
export const CARD_FONTS = {
  black: 'Chivo_900Black',
  extraBold: 'Chivo_800ExtraBold',
  bold: 'SpaceGrotesk_700Bold',
  semiBold: 'SpaceGrotesk_600SemiBold',
} as const;

/**
 * Clé de skin : les skins intégrés sont autocomplétés, mais toute chaîne est
 * acceptée — un skin créé dans le dashboard est une clé arbitraire.
 */
export type CardSkin = BuiltinSkinKey | (string & {});

/** Ce qu'un composant de carte accepte pour son apparence. */
export type CardSkinInput = CardSkin | SkinSpec;

/** Registre des skins intégrés (les skins boutique passent par le catalogue). */
export const CARD_SKINS = BUILTIN_SKINS;

/** Skins vendables en boutique, dérivés du registre (plus de liste en dur). */
export const PREMIUM_SKINS: BuiltinSkinKey[] = BUILTIN_SKIN_KEYS.filter(
  (k) => BUILTIN_SKINS[k].premium,
);

export type { SkinSpec };

/**
 * Échelle de la carte : 1 = largeur de référence 300 (celle pour laquelle les
 * tailles fixes ont été dessinées). Fournie par CardChrome après mesure,
 * consommée par les styles des cartes (équivalent natif des `cqw` du web).
 */
const CardScaleContext = createContext(1);
export function useCardScale(): number {
  return useContext(CardScaleContext);
}

/**
 * Balayage « foil » périodique (premium) — transform only, donc quasi gratuit
 * même sur un Android d'entrée de gamme.
 *
 * C'est le seul élément qui a besoin de la largeur réelle : une View animée se
 * translate en pixels, pas en coordonnées de `viewBox`. Les valeurs de la liste
 * de tracé sont donc remises à l'échelle (`width / draw.width`) — le web,
 * lui, exprime la même animation en pourcentages.
 */
function Sheen({ sheen, width }: { sheen: DrawSheen; width: number }) {
  const scale = width > 0 ? width / CARD_BASE_WIDTH : 0;
  const from = sheen.from * scale;
  const to = sheen.to * scale;
  const x = useSharedValue(from);

  useEffect(() => {
    if (scale === 0) return;
    x.value = from;
    x.value = withRepeat(
      withSequence(
        withDelay(
          sheen.holdMs,
          withTiming(to, {
            duration: sheen.travelMs,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        withTiming(from, { duration: 0 }),
      ),
      -1,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, scale, sheen.holdMs, sheen.travelMs]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  if (scale === 0) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        /* Confiné à la zone utile du bouclier (évite de peindre les coins
           transparents des crans). */
        {
          position: 'absolute',
          top: sheen.top * scale,
          height: sheen.height * scale,
          width: sheen.width * scale,
        },
        style,
      ]}>
      <Svg width="100%" height="100%" style={{ transform: [{ skewX: `${sheen.skewDeg}deg` }] }}>
        <Defs>
          <LinearGradient id="pc-sheen" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={sheen.color} stopOpacity={0} />
            <Stop offset="0.5" stopColor={sheen.color} stopOpacity={sheen.opacity} />
            <Stop offset="1" stopColor={sheen.color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#pc-sheen)" />
      </Svg>
    </Animated.View>
  );
}

/**
 * Traduit la liste de tracé partagée en éléments react-native-svg.
 * Le `viewBox` fait l'échelle : rien à mesurer, et le web produit le même
 * tracé aux mêmes coordonnées à partir de la même liste.
 */
function CardArtwork({ draw }: { draw: SkinDraw }) {
  return (
    <Svg
      viewBox={`0 0 ${draw.width} ${draw.height}`}
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFill}
      pointerEvents="none">
      <Defs>
        <LinearGradient
          id={draw.frame.id}
          x1={String(draw.frame.x1)}
          y1={String(draw.frame.y1)}
          x2={String(draw.frame.x2)}
          y2={String(draw.frame.y2)}>
          {draw.frame.stops.map((s, i) => (
            <Stop key={i} offset={String(s.offset)} stopColor={s.color} />
          ))}
        </LinearGradient>
        <LinearGradient
          id={draw.surface.id}
          x1={String(draw.surface.x1)}
          y1={String(draw.surface.y1)}
          x2={String(draw.surface.x2)}
          y2={String(draw.surface.y2)}>
          {draw.surface.stops.map((s, i) => (
            <Stop key={i} offset={String(s.offset)} stopColor={s.color} />
          ))}
        </LinearGradient>
        {draw.radials.map((r) => (
          <RadialGradient key={r.id} id={r.id} cx={String(r.cx)} cy={String(r.cy)} r={String(r.r)}>
            <Stop offset="0" stopColor={r.color} stopOpacity={r.opacity} />
            <Stop offset="1" stopColor={r.color} stopOpacity={0} />
          </RadialGradient>
        ))}
        <ClipPath id={draw.clipId}>
          <Polygon points={draw.surfacePoints} />
        </ClipPath>
      </Defs>

      {/* Liseré extérieur puis surface intérieure. */}
      <Polygon points={draw.framePoints} fill={`url(#${draw.frame.id})`} />
      <Polygon points={draw.surfacePoints} fill={`url(#${draw.surface.id})`} />

      {/* Halos et rayures, bornés à la surface. */}
      <G clipPath={`url(#${draw.clipId})`}>
        {draw.radials.map((r) => (
          <Rect key={r.id} width={draw.width} height={draw.height} fill={`url(#${r.id})`} />
        ))}
        {draw.stripes.map((l, i) => (
          <Line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={l.color}
            strokeOpacity={l.opacity}
            strokeWidth={l.width}
          />
        ))}
      </G>

      {/* Anneau intérieur brillant. */}
      <Polygon points={draw.surfacePoints} fill="none" stroke={draw.inner} />
    </Svg>
  );
}

export interface CardChromeProps {
  /** Clé de skin (intégrée ou boutique) ou spec complet. */
  skin: CardSkinInput;
  /** Force le foil même sur un skin non premium (aperçu de l'éditeur). */
  animated?: boolean;
  /**
   * Largeur maximale. Par défaut la largeur de référence : une carte ne peut
   * donc PAS devenir géante parce qu'elle a été posée dans un conteneur pleine
   * largeur — le web est borné par sa grille, le natif l'est ici.
   */
  maxWidth?: number;
  children: ReactNode;
}

/**
 * Enveloppe visuelle d'une carte : ratio 63/88 (comme le web), bouclier
 * « Founders » (liseré + surface + halos + rayures), foil animé si premium.
 * Mesure sa largeur pour fournir l'échelle typographique à ses enfants.
 */
export function CardChrome({
  skin,
  animated = false,
  maxWidth = CARD_BASE_WIDTH,
  children,
}: CardChromeProps) {
  const spec = useSkin(skin);
  /* La largeur n'est mesurée que pour l'échelle TYPOGRAPHIQUE (équivalent des
     `cqw` du web) : le tracé, lui, est prêt dès le premier rendu. */
  const [width, setWidth] = useState(0);

  /* Un identifiant par instance : plusieurs cartes coexistent dans un écran et
     des ids de dégradé dupliqués se marcheraient dessus. `useId` (et non
     Math.random) reste stable au rendu serveur de react-native-web. */
  const uid = `pc${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const draw = useMemo(() => buildSkinDraw(spec, uid), [spec, uid]);
  const showSheen = skinAnimated(spec, animated);
  const k = width > 0 ? cardScale(width) : 1;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.card, { maxWidth }]}>
      <CardArtwork draw={draw} />
      {draw.sheen && showSheen ? <Sheen sheen={draw.sheen} width={width} /> : null}

      <CardScaleContext.Provider value={k}>
        {/* Aucun padding : les blocs se positionnent en pourcentages depuis
            CARD_LAYOUT, exactement comme les règles `.pcard__*` du web. */}
        <View style={styles.content}>{children}</View>
      </CardScaleContext.Provider>
    </View>
  );
}

/**
 * Gabarit d'affichage d'une carte : borne la largeur à la référence (300 px,
 * celle pour laquelle les tailles ont été dessinées) et centre. À utiliser
 * partout où une carte s'affiche seule (profil, deck, boutique) — sans lui,
 * une carte pleine largeur d'écran clampe l'échelle à 1,2 et devient massive.
 */
export function CardSlot({
  children,
  maxWidth = CARD_BASE_WIDTH,
  style,
}: {
  children: ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.slot, { maxWidth }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    alignSelf: 'center',
    /* Ratio de carte fixe — identique au web (63/88). */
    aspectRatio: CARD_ASPECT,
    overflow: 'hidden',
  },
  content: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
