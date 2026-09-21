/**
 * Listes de réglages groupées — `@expo/ui` List / ListItem / FieldGroup.
 */
import {
  FieldGroup,
  Host,
  List,
  ListItem,
  type ListItemProps,
} from '@expo/ui';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../core';
import { Txt } from '../text';

export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <Host matchContents>
      <List>{children}</List>
    </Host>
  );
}

export function SettingsItem({
  children,
  onPress,
  leading,
  trailing,
  supportingText,
}: ListItemProps) {
  return (
    <ListItem
      onPress={onPress}
      leading={leading}
      trailing={trailing}
      supportingText={supportingText}
    >
      {children}
    </ListItem>
  );
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
  // La marge se pose À L'EXTÉRIEUR de `Host`. Placée dedans, sa `View`
  // s'intercalait entre l'hôte Compose et le `FieldGroup`, ce que Compose
  // refuse : « inserting another <View> between <Host> and this component
  // breaks the Compose composition boundary ». Le groupe ne se rendait pas du
  // tout, et ses enfants — de simples chaînes — remontaient à React Native,
  // qui se plaignait à son tour d'un texte hors d'un `<Text>`.
  //
  // LE PIED DE GROUPE SORT AUSSI, et pour une raison voisine mesurée à
  // l'appareil : `FieldGroup.SectionFooter` reçoit sa légende en ENFANT, et
  // cette chaîne traverse l'arbre React Native avant d'atteindre Compose —
  // une erreur « Text strings must be rendered within a <Text> component » à
  // CHAQUE rendu, comptée exactement une fois par groupe (trois groupes sur
  // l'écran Profil, trois erreurs). Le titre, lui, passe par une PROP et ne
  // pose aucun problème : il reste à sa place.
  //
  // Rendu dans notre propre `Txt`, le pied gagne au passage la typographie du
  // produit là où Compose imposait la sienne.
  return (
    <View style={{ marginBottom: spacing['3'] }}>
      <Host matchContents>
        <FieldGroup>
          <FieldGroup.Section title={header}>{children}</FieldGroup.Section>
        </FieldGroup>
      </Host>
      {footer ? (
        <Txt variant="caption" tone="muted" style={styles.footer}>
          {footer}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Aligné sur le retrait intérieur du groupe Compose, pour que la légende
  // parte du même bord que le libellé qu'elle explique.
  footer: { paddingHorizontal: spacing['4'], paddingTop: spacing['1'] },
});
