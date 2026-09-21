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
import { View } from 'react-native';

import { spacing } from '../core';

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
  // qui se plaignait à son tour d'un texte hors d'un `<Text>`. Deux erreurs à
  // chaque rendu de l'écran Profil, pour une `View` mal placée.
  return (
    <View style={{ marginBottom: spacing['3'] }}>
      <Host matchContents>
        <FieldGroup>
          <FieldGroup.Section title={header}>
            {footer ? (
              <FieldGroup.SectionFooter>{footer}</FieldGroup.SectionFooter>
            ) : null}
            {children}
          </FieldGroup.Section>
        </FieldGroup>
      </Host>
    </View>
  );
}
