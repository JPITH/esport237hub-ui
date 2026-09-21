/**
 * Boîte de dialogue maison — remplace `Alert.alert` de react-native.
 *
 * Demande porteur (21/09/2026) : « dans l'app mobile, pas de popup natif, des
 * popups custom avec notre DA ». Une alerte native est peinte par le SYSTÈME :
 * ses couleurs, ses rayons, sa typographie et jusqu'à l'ordre de ses boutons
 * changent d'un Android à l'autre, et sur un téléphone à police fantaisie —
 * celui du porteur — elle s'affiche dans cette police-là. Au milieu d'un
 * produit qui soigne sa direction artistique, c'est le seul endroit qui
 * ressemble à autre chose.
 *
 * Ce composant est VOLONTAIREMENT pauvre : titre, message facultatif, et une
 * liste d'actions. Il ne prend pas d'enfants libres — une boîte de dialogue
 * qui accepte n'importe quel contenu redevient une feuille, et le projet en a
 * déjà une (`Sheet`). Pour un formulaire ou un choix long, c'est `Sheet` qu'il
 * faut, pas ceci.
 *
 * Les actions sont EMPILÉES et pleine largeur, pas côte à côte : deux libellés
 * français (« Annuler » / « Annuler l'évènement ») ne tiennent pas sur une
 * ligne de téléphone, et la rangée se coupe en deux hauteurs inégales.
 */
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, useE237Colors } from './core';
import { Txt } from './text';

export type DialogActionTone = 'default' | 'primary' | 'destructive';

export interface DialogAction {
  label: string;
  /** Omis = l'action ne fait que refermer (bouton d'annulation). */
  onPress?: () => void;
  tone?: DialogActionTone;
  disabled?: boolean;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  /** Pictogramme au-dessus du titre — 24 px conseillés. */
  icon?: ReactNode;
  /**
   * Dans l'ordre d'affichage. L'usage veut l'annulation EN DERNIER : le pouce
   * arrive par le bas, et une action destructrice sous le doigt au repos se
   * déclenche toute seule.
   */
  actions: DialogAction[];
}

export function Dialog({
  open,
  onClose,
  title,
  message,
  icon,
  actions,
}: DialogProps) {
  const c = useE237Colors();

  /**
   * Refermer PUIS agir. L'inverse laisse la boîte à l'écran pendant que
   * l'action navigue ou lance un appel réseau, et on la voit se superposer à
   * l'écran suivant.
   */
  function run(action: DialogAction) {
    onClose();
    action.onPress?.();
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      // Le retour matériel d'Android ferme, comme le fait une alerte native.
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[
            styles.card,
            { backgroundColor: c.surfaceRaised, borderColor: c.border },
          ]}
          // Un appui DANS la boîte ne doit pas la fermer.
          onPress={(e) => e.stopPropagation()}
        >
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Txt variant="heading" align="center">
            {title}
          </Txt>
          {message ? (
            <Txt variant="body" tone="secondary" align="center">
              {message}
            </Txt>
          ) : null}

          <View style={styles.actions}>
            {actions.map((action) => (
              <DialogButton
                key={action.label}
                action={action}
                onRun={() => run(action)}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DialogButton({
  action,
  onRun,
}: {
  action: DialogAction;
  onRun: () => void;
}) {
  const c = useE237Colors();
  const tone = action.tone ?? 'default';

  const fond =
    tone === 'primary' ? c.accent : tone === 'destructive' ? c.danger : 'transparent';
  const encre =
    tone === 'primary'
      ? c.onAccent
      : tone === 'destructive'
        ? c.onAccent
        : c.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!action.disabled }}
      disabled={action.disabled}
      onPress={onRun}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: fond,
          borderColor: tone === 'default' ? c.border : 'transparent',
          borderWidth: tone === 'default' ? 1 : 0,
          opacity: action.disabled ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Txt variant="label" color={encre} align="center" numberOfLines={2}>
        {action.label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4'],
    backgroundColor: '#000000AA',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    padding: spacing['4'],
    gap: spacing['2'],
  },
  icon: { alignItems: 'center', paddingBottom: spacing['1'] },
  // Rayon intérieur = rayon extérieur − padding : une action collée au bord
  // d'une carte arrondie doit suivre sa courbe, pas la couper.
  actions: { gap: spacing['2'], paddingTop: spacing['2'] },
  action: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3'],
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
});
