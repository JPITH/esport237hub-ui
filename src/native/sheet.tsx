import type { ComponentType, ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radius, spacing, useE237Colors } from './core';
import { Txt } from './text';

type SheetScrollProps = {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: boolean | 'handled' | 'always' | 'never';
  showsVerticalScrollIndicator?: boolean;
  bottomOffset?: number;
  extraKeyboardSpace?: number;
  children?: ReactNode;
};

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Sous-titre optionnel sous le titre. */
  subtitle?: string;
  children: ReactNode;
  /**
   * Contenu scrollable (formulaires longs, multi-étapes). Hauteur max ≈ 88 %
   * de l’écran pour laisser le backdrop cliquable.
   */
  scrollable?: boolean;
  /** Contenu collé en bas (CTA) — hors scroll. */
  footer?: ReactNode;
  /**
   * Scroll clavier-aware (ex. KeyboardAwareScrollView). Défaut : ScrollView RN.
   * N’a d’effet que si `scrollable`.
   */
  ScrollComponent?: ComponentType<SheetScrollProps>;
}

/**
 * Châssis de feuille modale (ouverte par le bas) : backdrop, poignée, titre.
 * Base commune de SelectSheet, DateField, TimeField et des formulaires
 * multi-étapes (création d’évènement, salle, recharge).
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  scrollable = false,
  footer,
  ScrollComponent = ScrollView,
}: SheetProps) {
  const c = useE237Colors();
  const { height } = useWindowDimensions();
  const maxHeight = Math.round(height * 0.88);
  const Scroll = ScrollComponent;

  const body = scrollable ? (
    <Scroll
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
      bottomOffset={24}
      extraKeyboardSpace={16}
    >
      {children}
    </Scroll>
  ) : (
    children
  );

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: c.surfaceRaised,
              borderColor: c.border,
              maxHeight,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          {title ? (
            <View style={styles.header}>
              <Txt variant="heading">{title}</Txt>
              {subtitle ? (
                <Txt variant="caption" tone="secondary">
                  {subtitle}
                </Txt>
              ) : null}
            </View>
          ) : null}
          {body}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing['4'],
    gap: spacing['3'],
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.full },
  header: { gap: 2 },
  scroll: { flexGrow: 0 },
  scrollContent: { gap: spacing['3'], paddingBottom: spacing['2'] },
  footer: { gap: spacing['2'], paddingTop: spacing['1'] },
});
