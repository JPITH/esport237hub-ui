/**
 * Image distante réutilisable (natif) — jumelle de `./web/media-image`.
 *
 * - URL absente ou en erreur → repli illustré sur `surfaceRaised`, jamais un
 *   cadre vide/cassé ;
 * - cadre à ratio fixe : la liste ne saute pas pendant le chargement ;
 * - état de chargement discret (ActivityIndicator, aucune dépendance ajoutée).
 */
import { ImageOff } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { font, radius, spacing, useE237Colors } from './core';

/** Rayon d'arrondi, pris dans les tokens. */
export type MediaRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

const RADIUS: Record<MediaRounded, number> = {
  none: 0,
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  full: radius.full,
};

export interface MediaImageProps {
  /** URL distante ; `null`/`undefined` → repli visuel. */
  src?: string | null;
  /** Description pour les lecteurs d'écran (produit, événement, salle…). */
  alt: string;
  /** Ratio largeur / hauteur (défaut 16 / 9). */
  ratio?: number;
  rounded?: MediaRounded;
  /** `cover` (défaut) remplit le cadre, `contain` montre le média entier. */
  fit?: 'cover' | 'contain';
  /** Icône Lucide de repli (défaut `ImageOff`). */
  fallbackIcon?: ReactNode;
  /** Courte légende sous l'icône de repli (ex. « Photo à venir »). */
  fallbackLabel?: string;
  style?: StyleProp<ViewStyle>;
}

type Status = 'loading' | 'ready' | 'error';

export function MediaImage({
  src,
  alt,
  ratio = 16 / 9,
  rounded = 'md',
  fit = 'cover',
  fallbackIcon,
  fallbackLabel,
  style,
}: MediaImageProps) {
  const c = useE237Colors();
  const [status, setStatus] = useState<Status>(src ? 'loading' : 'error');

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  const failed = !src || status === 'error';

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={alt}
      style={[
        styles.frame,
        {
          aspectRatio: ratio,
          borderRadius: RADIUS[rounded],
          backgroundColor: c.surfaceRaised,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {src && !failed ? (
        <Image
          source={{ uri: src }}
          resizeMode={fit}
          style={styles.image}
          accessibilityIgnoresInvertColors
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      ) : null}

      {src && status === 'loading' ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="small" color={c.textMuted} />
        </View>
      ) : null}

      {failed ? (
        <View style={styles.overlay} pointerEvents="none">
          {fallbackIcon ?? <ImageOff color={c.textMuted} size={26} strokeWidth={1.25} />}
          {fallbackLabel ? (
            <Text style={[styles.fallbackLabel, { color: c.textMuted }]} numberOfLines={2}>
              {fallbackLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['1'],
    padding: spacing['2'],
  },
  fallbackLabel: {
    fontSize: font.size.xs,
    textAlign: 'center',
  },
});
