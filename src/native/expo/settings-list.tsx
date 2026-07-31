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
  return (
    <Host matchContents>
      <View style={{ marginBottom: spacing['3'] }}>
        <FieldGroup>
          <FieldGroup.Section title={header}>
            {footer ? (
              <FieldGroup.SectionFooter>{footer}</FieldGroup.SectionFooter>
            ) : null}
            {children}
          </FieldGroup.Section>
        </FieldGroup>
      </View>
    </Host>
  );
}
