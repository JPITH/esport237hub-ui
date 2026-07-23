import { radius, spacing, useE237Colors } from './core';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Châssis de feuille modale (ouverte par le bas) : backdrop, poignée, titre.
 * Base commune de SelectSheet, DateField, TimeField… — le châssis était
 * recopié dans chaque composant (dette notée au journal), il vit désormais ici.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const c = useE237Colors();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: c.surfaceRaised, borderColor: c.border }]}
          onPress={(e) => e.stopPropagation()}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          {title ? (
            <Text style={{ color: c.textPrimary, fontWeight: '700', fontSize: 16 }}>{title}</Text>
          ) : null}
          {children}
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
});
