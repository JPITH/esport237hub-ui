/**
 * Essayage de skins de carte (parité web « Mes skins » / `previewSkin`).
 *
 * Une pastille par skin : vignette peinte avec le VRAI dégradé du skin, donc
 * tout skin — intégré OU créé dans le dashboard et chargé depuis l'API —
 * apparaît ici sans code supplémentaire. Sélectionner un skin ne l'équipe
 * pas : c'est un aperçu ; l'équipement reste une action explicite.
 */
import { useId } from 'react';
import { Check, Lock } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

import { stopColor } from '../skins/spec';
import { useSkin } from '../skins/context';

import { type CardSkinInput } from './card-skins';
import { radius, spacing, useE237Colors } from './core';
import { haptic } from './haptics';
import { useNeu } from './neu';
import { Txt } from './text';

/** Silhouette « Founders » simplifiée pour la vignette. */
const SWATCH_SHAPE = '0.12,0 0.88,0 1,0.12 1,0.78 0.5,1 0,0.78 0,0.12';

/** Points SVG de la vignette, réduits vers le centre pour la surface. */
function swatchPoints(w: number, h: number, inset = 0): string {
  const k = 1 - inset;
  return SWATCH_SHAPE.split(' ')
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return `${((0.5 + (x - 0.5) * k) * w).toFixed(1)},${((0.5 + (y - 0.5) * k) * h).toFixed(1)}`;
    })
    .join(' ');
}

export interface SkinSwatchProps {
  skin: CardSkinInput;
  selected?: boolean;
  locked?: boolean;
  onPress?: () => void;
  width?: number;
}

/** Vignette d'un skin — dégradé réel du skin, cadenas si non possédé. */
export function SkinSwatch({
  skin,
  selected,
  locked,
  onPress,
  width = 60,
}: SkinSwatchProps) {
  const c = useE237Colors();
  const neu = useNeu();
  const spec = useSkin(skin);
  const height = Math.round((width * 88) / 63);
  /* Ids uniques par vignette : deux rails de skins sur un même écran
     partageraient sinon leurs dégradés. */
  const uid = `sw${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${spec.label}${locked ? ' (verrouillé)' : ''}`}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={() => {
        haptic('selection');
        onPress?.();
      }}
      style={({ pressed }) => [styles.swatch, { width }, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.swatchMedia,
          { width, height },
          selected ? neu.primaryGlow(spec.accent) : neu.raisedSm,
        ]}
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient
              id={`${uid}-frame`}
              x1={String(spec.frame.x1)}
              y1={String(spec.frame.y1)}
              x2={String(spec.frame.x2)}
              y2={String(spec.frame.y2)}
            >
              {spec.frame.stops.map((s, i) => (
                <Stop key={i} offset={String(s.offset)} stopColor={s.color} />
              ))}
            </LinearGradient>
            <LinearGradient
              id={`${uid}-bg`}
              x1={String(spec.surface.x1)}
              y1={String(spec.surface.y1)}
              x2={String(spec.surface.x2)}
              y2={String(spec.surface.y2)}
            >
              {spec.surface.stops.map((s, i) => (
                <Stop key={i} offset={String(s.offset)} stopColor={s.color} />
              ))}
            </LinearGradient>
          </Defs>
          <Polygon points={swatchPoints(width, height)} fill={`url(#${uid}-frame)`} />
          <Polygon points={swatchPoints(width, height, 0.12)} fill={`url(#${uid}-bg)`} />
        </Svg>

        {locked ? (
          <View style={[styles.swatchBadge, { backgroundColor: `${c.bg}CC` }]}>
            <Lock color={c.textSecondary} size={14} />
          </View>
        ) : selected ? (
          <View style={[styles.swatchCheck, { backgroundColor: spec.accent }]}>
            <Check color={stopColor(spec.surface, 2)} size={11} strokeWidth={3.5} />
          </View>
        ) : null}
      </View>

      <Txt
        variant={selected ? 'label' : 'caption'}
        size={10}
        tone={selected ? 'primary' : 'secondary'}
        align="center"
        numberOfLines={1}
      >
        {spec.label}
      </Txt>
    </Pressable>
  );
}

/** Clé stable d'un skin, qu'on ait reçu une clé ou un spec complet. */
function skinKeyOf(skin: CardSkinInput): string {
  return typeof skin === 'string' ? skin : skin.key;
}

export interface SkinPickerProps {
  /** Skins proposés (clés ou specs), dans l'ordre d'affichage. */
  skins: CardSkinInput[];
  /** Clé du skin actuellement prévisualisé. */
  value?: string;
  onChange: (skinKey: string) => void;
  /** Clés des skins possédés ; les autres sont affichés verrouillés. */
  owned?: readonly string[];
  /** Le tap sur un skin verrouillé ouvre la boutique. */
  onLockedPress?: (skinKey: string) => void;
  swatchWidth?: number;
}

/** Rail horizontal d'essayage de skins. */
export function SkinPicker({
  skins,
  value,
  onChange,
  owned,
  onLockedPress,
  swatchWidth,
}: SkinPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rail}
      contentContainerStyle={styles.railContent}
    >
      {skins.map((skin) => {
        const key = skinKeyOf(skin);
        const locked = owned ? !owned.includes(key) : false;
        return (
          <SkinSwatch
            key={key}
            skin={skin}
            width={swatchWidth}
            selected={key === value}
            locked={locked}
            onPress={() => (locked ? onLockedPress?.(key) : onChange(key))}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { marginHorizontal: -spacing['4'] },
  railContent: {
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
    alignItems: 'flex-start',
  },
  swatch: { alignItems: 'center', gap: spacing['1'], minHeight: 44 },
  swatchMedia: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  swatchBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    position: 'absolute',
    right: -3,
    top: -3,
    width: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
