/**
 * Listes de réglages groupées.
 *
 * ── POURQUOI CE FICHIER N'UTILISE PLUS `@expo/ui` ──────────────────────────
 *
 * Il s'appuyait sur `FieldGroup` / `List` d'`@expo/ui`, deux composants
 * Compose qui défilent VERTICALEMENT (une `LazyColumn`), posés dans un
 * `<Host matchContents>`. `matchContents` demande à l'hôte de se dimensionner
 * sur son contenu, donc de mesurer avec une hauteur INFINIE — et Compose
 * refuse catégoriquement de mesurer un conteneur défilant ainsi :
 *
 *   java.lang.IllegalStateException: Vertically scrollable component was
 *   measured with an infinity maximum height constraints, which is disallowed.
 *       at expo.modules.ui.HostView$MaybeMatchContentsLayout…
 *
 * Ce n'est pas un avertissement : c'est une EXCEPTION FATALE. Constatée sur
 * l'appareil du porteur le 21/09/2026 — ouvrir l'écran Profil fermait
 * l'application et renvoyait au lanceur. Et le piège est structurel : un écran
 * de réglages vit toujours dans une vue défilante, donc l'hôte y sera toujours
 * mesuré sans borne. Ces deux composants ne peuvent PAS y être utilisés.
 *
 * On les rend donc avec nos propres primitives. Ce qu'on perd : le rendu natif
 * exact du système. Ce qu'on gagne : un écran qui ne tue plus l'application,
 * la typographie du produit, et la fin des erreurs « Text strings must be
 * rendered within a <Text> component » que la frontière Compose produisait à
 * chaque rendu.
 *
 * L'interrupteur natif, lui, RESTE en Compose (`./switch`) : un `Switch` ne
 * défile pas, son hôte se mesure sans problème.
 * ──────────────────────────────────────────────────────────────────────────
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useE237Colors } from '../core';
import { Txt } from '../text';

export interface SettingsItemProps {
  children: ReactNode;
  onPress?: () => void;
  /** Pictogramme à gauche — 20 px conseillés. */
  leading?: ReactNode;
  /** Contrôle à droite : interrupteur, valeur, chevron. */
  trailing?: ReactNode;
  /** Précision sous le libellé. */
  supportingText?: string;
}

export function SettingsItem({
  children,
  onPress,
  leading,
  trailing,
  supportingText,
}: SettingsItemProps) {
  const c = useE237Colors();

  const contenu = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.itemMain}>
        {/* `children` est le libellé : une chaîne, qu'on enveloppe NOUS. La
            laisser traverser un composant Compose était l'autre défaut de
            l'ancienne version. */}
        <Txt variant="body">{children}</Txt>
        {supportingText ? (
          <Txt variant="caption" tone="muted">
            {supportingText}
          </Txt>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  if (!onPress) {
    // Une rangée qui ne mène nulle part n'est pas un bouton : elle ne doit ni
    // s'enfoncer sous le doigt, ni être annoncée comme cliquable.
    return <View style={styles.item}>{contenu}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && { backgroundColor: c.surface },
      ]}
    >
      {contenu}
    </Pressable>
  );
}

export function SettingsList({ children }: { children: ReactNode }) {
  return <Groupe>{children}</Groupe>;
}

export function SettingsGroup({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      {header ? <Txt variant="overline" tone="cyan">{header}</Txt> : null}
      <Groupe>{children}</Groupe>
      {footer ? (
        <Txt variant="caption" tone="muted" style={styles.footer}>
          {footer}
        </Txt>
      ) : null}
    </View>
  );
}

/**
 * Le cadre commun : une surface, un contour, et un filet d'un cheveu entre
 * deux rangées. Pas de bordure par rangée — N bordures pour N-1 séparations
 * dessinent toujours un trait de trop en haut ou en bas.
 */
function Groupe({ children }: { children: ReactNode }) {
  const c = useE237Colors();
  return (
    <View
      style={[
        styles.frame,
        { backgroundColor: c.surfaceRaised, borderColor: c.border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing['1'], marginBottom: spacing['3'] },
  frame: {
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    // 56 px : la rangée porte un libellé ET parfois une précision, la cible
    // tactile de 44 px ne suffit pas à la faire respirer.
    minHeight: 56,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
  },
  leading: { width: 24, alignItems: 'center' },
  itemMain: { flex: 1, gap: 2 },
  trailing: { marginLeft: 'auto' },
  footer: { paddingHorizontal: spacing['1'] },
});
