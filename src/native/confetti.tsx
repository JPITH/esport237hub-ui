/**
 * Gerbe de confettis — maison, légère, sur le fil UI. UNE pour toute l'app :
 * la révélation d'un duel et la victoire au Ludo en avaient chacune une, et
 * celle du Ludo ignorait « réduire les animations ».
 *
 * Une seule valeur partagée (le temps, 0 → 1) anime tous les éclats ; chaque
 * éclat lit sa trajectoire dans `confettiAt` (`./confetti-model`, pure et
 * testée). Aucun `setState` par image, aucune dépendance de plus : de simples
 * `View` rectangulaires, tournées. Les couleurs viennent de l'écran (skin de
 * la carte, tons du système), jamais d'ici.
 *
 * Trois règles portées par le composant, pour qu'aucun écran ne les oublie :
 *
 *  - « Réduire les animations » : pas de gerbe du tout (`shouldBurst`).
 *  - La gerbe ne part qu'au CHANGEMENT de `fireKey`, jamais à chaque rendu :
 *    un écran qui se redessine à chaque trame (le plateau du Ludo, sa
 *    passerelle temps réel) ne doit pas rejouer la pluie à chacune.
 *  - Une fois retombée, elle se DÉMONTE : trente vues immobiles posées
 *    au-dessus d'un plateau n'ont plus rien à y faire.
 */
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { confettiAt, confettiPieces, shouldBurst, type ConfettiPiece } from './confetti-model';

export interface ConfettiBurstProps {
  /** S'incrémente pour tirer une gerbe ; 0 = rien. */
  fireKey: number;
  /** Palette — skin de la carte et tons du système, jamais un hex écrit à la main. */
  colors: readonly string[];
  /** Nombre d'éclats (défaut 34 : une fête, pas un écran masqué). */
  count?: number;
  /** Durée de la gerbe, en ms (défaut 1 700). */
  durationMs?: number;
  /** Point de départ, relatif au parent positionné (défaut : centre, à 40 % du haut). */
  origin?: { left: DimensionValue; top: DimensionValue };
  /** Graine du tirage — même graine, même gerbe (captures, tests). */
  seed?: number;
}

function Piece({
  piece,
  color,
  t,
}: {
  piece: ConfettiPiece;
  color: string;
  t: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const at = confettiAt(piece, t.value);
    return {
      opacity: at.opacity,
      transform: [{ translateX: at.x }, { translateY: at.y }, { rotate: `${at.rotate}deg` }],
    };
  });
  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: piece.width,
          height: piece.height,
          marginLeft: -piece.width / 2,
          marginTop: -piece.height / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function ConfettiBurst({
  fireKey,
  colors,
  count = 34,
  durationMs = 1700,
  origin = DEFAULT_ORIGIN,
  seed,
}: ConfettiBurstProps) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  const [live, setLive] = useState(false);
  const pieces = useMemo(
    () => confettiPieces(count, colors.length, seed),
    [count, colors.length, seed],
  );

  useEffect(() => {
    if (!shouldBurst(fireKey, reduced)) return;
    setLive(true);
    t.value = 0;
    t.value = withTiming(1, { duration: durationMs, easing: Easing.out(Easing.quad) });
    const stop = setTimeout(() => setLive(false), durationMs + 150);
    return () => clearTimeout(stop);
  }, [fireKey, reduced, durationMs, t]);

  if (!live || reduced || colors.length === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={[styles.origin, origin]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {pieces.map((piece, i) => (
        <Piece key={i} piece={piece} color={colors[piece.colorIndex] ?? colors[0]!} t={t} />
      ))}
    </View>
  );
}

const DEFAULT_ORIGIN = { left: '50%', top: '40%' } as const;

const styles = StyleSheet.create({
  origin: { position: 'absolute', width: 0, height: 0 },
  piece: { position: 'absolute', left: 0, top: 0, borderRadius: 2 },
});
