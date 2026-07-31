/**
 * Cadre d'un QR code (natif) — jumeau de `./web/qr-frame`.
 *
 * Le design system n'ENCODE pas le QR : l'encodage dépend d'une bibliothèque
 * par plateforme (`qrcode` côté web, `react-native-qrcode-svg` côté natif) et
 * un code mal encodé casse silencieusement le contrôle à l'entrée. Il fournit
 * le cadre commun : dimension fixe, squelette de chargement, état « déjà
 * utilisé ».
 *
 * Le code fourni doit embarquer sa PROPRE zone tranquille claire
 * (`quietZone`) : c'est ce qui le rend scannable dans les deux thèmes sans
 * poser une seule couleur en dur dans l'interface.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, useE237Colors } from './core';

export interface QrFrameProps {
  /** Le QR rendu par l'application ; absent = squelette de chargement. */
  children?: ReactNode;
  /** Côté du cadre en pixels (défaut 140). */
  size?: number;
  /**
   * Le code a déjà servi : on le grise sans le retirer, pour que le porteur
   * comprenne qu'il s'agit bien de SON billet, déjà scanné.
   */
  used?: boolean;
  /** Description accessible (« QR de check-in du billet »). */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function QrFrame({
  children,
  size = 140,
  used = false,
  label = 'QR code',
  style,
}: QrFrameProps) {
  const c = useE237Colors();

  if (!children) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${label} — chargement`}
        style={[
          styles.frame,
          { width: size, height: size, backgroundColor: c.surfaceRaised },
          style,
        ]}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={used ? `${label} — déjà utilisé` : label}
      style={[
        styles.frame,
        { width: size, height: size },
        used && styles.used,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.md,
    padding: spacing['0'],
  },
  used: { opacity: 0.4 },
});
