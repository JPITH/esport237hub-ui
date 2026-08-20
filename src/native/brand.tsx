/**
 * Bloc de marque : le SIGNE (hexagone + monogramme « G/H ») + « ESPORT 237
 * HUB » (natif) — jumeau de la `BrandLockup` du web (même nom, mêmes props
 * sauf `href`, remplacé par `onPress` : le design system ne connaît pas le
 * routeur).
 *
 * La pastille verte au « E » a vécu jusqu'au 20/08/2026 ; le signe la
 * remplace, et c'est le même dessin que l'icône de l'application.
 */
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { font, spacing, useE237Colors } from './core';
import { AppMark } from './mark';

export interface BrandLockupProps {
  /** `sm` (32 px) pour les en-têtes, `md` (36 px) pour les écrans d'accueil. */
  size?: 'sm' | 'md';
  /** Masque le mot-symbole et ne garde que le signe seul. */
  compact?: boolean;
  /** Rend l'ensemble pressable (retour à l'accueil, par exemple). */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function BrandLockup({
  size = 'sm',
  compact = false,
  onPress,
  style,
}: BrandLockupProps) {
  const c = useE237Colors();
  const box = size === 'md' ? 36 : 32;

  const content = (
    <View style={[styles.row, style]}>
      <AppMark size={box} />
      {compact ? null : (
        <Text style={[styles.wordmark, { color: c.textPrimary }]}>
          ESPORT <Text style={{ color: c.accent }}>237</Text> HUB
        </Text>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="ESPORT 237 HUB — accueil"
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {content}
    </Pressable>
  );
}

export interface AppLogoProps {
  /** Côté du signe, en pixels. */
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Le signe SEUL, sans mot-symbole. Réservé aux en-têtes d'écran où le nom du
 * produit ferait doublon avec le contenu : sur l'accueil, l'utilisateur sait
 * dans quelle application il est, la place vaut mieux au solde et au profil.
 * `BrandLockup` reste le bloc complet (signe + nom) partout ailleurs.
 *
 * C'était une image bitmap (`assets/logo.png`, les manettes) jusqu'au
 * 20/08/2026 : elle ne correspondait plus au signe retenu, et un PNG ne suit
 * pas le thème. Le vectoriel s'en charge.
 */
export function AppLogo({ size = 32, onPress, style }: AppLogoProps) {
  const mark = <AppMark size={size} style={style} />;

  if (!onPress) return mark;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="ESPORT 237 HUB — accueil"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {mark}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  wordmark: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    letterSpacing: -0.2,
  },
  pressed: { opacity: 0.85 },
});
