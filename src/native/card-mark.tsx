/**
 * Le SIGNE au pied de la carte joueur (natif) — jumeau de `../web/card-mark`.
 *
 * Retour du porteur (09/10/2026, lot M3) : la pilule « G-HUB » cède la place
 * au signe (`lib/brand-mark`, ses tracés et eux seuls), animé en boucle.
 * Encres du skin (`cardMarkInks`) : sur la carte, le thème c'est le skin.
 *
 * L'ÉCLAT (partition `CARD_MARK_GLINT`, `lib/brand-motion`) : une bande de
 * lumière inclinée traverse le signe, puis il se repose. Elle est faite de
 * VUES et de transformations seulement — une fente (`overflow: hidden`) qui
 * glisse et tourne de 20°, et dedans une copie claire du signe qui fait le
 * mouvement inverse, donc reste en place : seule la fente bouge. Pas de
 * propriété SVG animée (le web de react-native-svg ne les écrit pas,
 * LEARNINGS « Ludo »), pas de `skewX` (ignoré par Android) : `rotate` et
 * `translateX` marchent partout. Deux fentes emboîtées (large et pâle,
 * étroite et vive) adoucissent les bords.
 *
 * Coût : UNE horloge Reanimated pour toutes les cartes de l'écran (démarrée
 * au premier signe monté, arrêtée au dernier — comme `Skeleton`), lue sur le
 * fil UI. Aucun état React, aucun rendu de la carte de plus.
 *
 * Immobile si `still` (exports, captures) ou si le système demande de
 * réduire les animations (`useReducedMotion`) : le signe seul, sans éclat.
 */
import { memo, useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  makeMutable,
  useAnimatedStyle,
  useReducedMotion,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import {
  MARK_HEX_SOLID_PATH,
  MARK_LETTER_G_PATH,
  MARK_LETTER_H_PATH,
  MARK_RING_PATH,
  MARK_SOLID_BELOW,
  MARK_VIEW_BOX,
  markParts,
} from '../lib/brand-mark';
import { CARD_MARK_CYCLE_MS, CARD_MARK_GLINT, glintTravel } from '../lib/brand-motion';
import { BRAND_NAME } from '../lib/brand-name';
import { cardMarkInks } from '../skins/geometry';
import type { SkinSpec } from '../skins/spec';

/**
 * Horloge unique : 0 → 1 en `CARD_MARK_CYCLE_MS`, en boucle, partagée par
 * tous les signes montés. Un compteur de montages l'arrête quand le dernier
 * s'en va (onglet quitté : rien ne tourne pour personne).
 */
const glintClock = makeMutable(0);
let glintMounts = 0;

function retainGlintClock(): () => void {
  glintMounts += 1;
  if (glintMounts === 1) {
    glintClock.value = 0;
    glintClock.value = withRepeat(
      withTiming(1, { duration: CARD_MARK_CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }
  return () => {
    glintMounts -= 1;
    if (glintMounts === 0) {
      cancelAnimation(glintClock);
      glintClock.value = 0;
    }
  };
}

/** Les deux fentes : largeur (fraction du signe) et opacité du reflet. */
const SLITS = [
  { width: CARD_MARK_GLINT.band, opacity: 0.4 },
  { width: CARD_MARK_GLINT.band * 0.42, opacity: 0.65 },
] as const;

/**
 * Hauteur d'une fente, en fraction du signe : assez pour couvrir le signe
 * une fois tournée de 20°.
 */
const SLIT_HEIGHT = 1.6;

const ANGLE = `${CARD_MARK_GLINT.angleDeg}deg`;
const COUNTER_ANGLE = `${-CARD_MARK_GLINT.angleDeg}deg`;

/** La copie claire du signe que la fente laisse voir. */
function GlintArt({ size, solid, color }: { size: number; solid: boolean; color: string }) {
  return (
    <Svg viewBox={MARK_VIEW_BOX} width={size} height={size}>
      {solid ? (
        <Path d={MARK_HEX_SOLID_PATH} fill={color} />
      ) : (
        <>
          <Path d={MARK_RING_PATH} fill={color} />
          <Path d={MARK_LETTER_G_PATH} fill={color} />
          <Path d={MARK_LETTER_H_PATH} fill={color} />
        </>
      )}
    </Svg>
  );
}

function MarkGlint({ size, solid, color }: { size: number; solid: boolean; color: string }) {
  useEffect(retainGlintClock, []);

  /* La bande part d'un côté de signe à gauche du centre et finit d'un côté à
     droite : hors du signe aux deux bouts (comme le masque du web). */
  const reach = size;
  const slitStyle = useAnimatedStyle(() => {
    const x = -reach + 2 * reach * glintTravel(glintClock.value);
    return { transform: [{ translateX: x }, { rotate: ANGLE }] };
  });
  const counterStyle = useAnimatedStyle(() => {
    const x = -reach + 2 * reach * glintTravel(glintClock.value);
    return { transform: [{ rotate: COUNTER_ANGLE }, { translateX: -x }] };
  });

  const height = size * SLIT_HEIGHT;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }}>
      {SLITS.map((slit) => {
        const width = size * slit.width;
        return (
          <Animated.View
            key={slit.width}
            style={[
              {
                position: 'absolute',
                overflow: 'hidden',
                width,
                height,
                left: (size - width) / 2,
                top: (size - height) / 2,
              },
              slitStyle,
            ]}>
            {/* Même centre que la fente : la transformation inverse le
                ramène exactement sur le signe. */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: size,
                  height: size,
                  left: (width - size) / 2,
                  top: (height - size) / 2,
                  opacity: slit.opacity,
                },
                counterStyle,
              ]}>
              <GlintArt size={size} solid={solid} color={color} />
            </Animated.View>
          </Animated.View>
        );
      })}
    </View>
  );
}

export interface CardMarkProps {
  /** Skin résolu de la carte. */
  spec: SkinSpec;
  /** Côté du signe, en points (la carte le calcule depuis son échelle). */
  size: number;
  /** Signe immobile : exports, captures. */
  still?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mémoïsé : la carte se re-rend quand sa note monte ou quand elle se
 * retourne ; le signe, lui, ne dépend que du skin et de sa taille.
 */
export const CardMark = memo(function CardMark({ spec, size, still = false, style }: CardMarkProps) {
  const reduced = useReducedMotion();
  const inks = cardMarkInks(spec);
  const parts = markParts(size);
  const solid = size < MARK_SOLID_BELOW;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={BRAND_NAME}>
      <Svg viewBox={MARK_VIEW_BOX} width={size} height={size}>
        {parts.map((part) => (
          <Path key={part.key} d={part.d} fill={inks[part.role]} />
        ))}
      </Svg>
      {still || reduced ? null : <MarkGlint size={size} solid={solid} color={inks.glint} />}
    </View>
  );
});
