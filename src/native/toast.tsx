/**
 * Bandeau de confirmation (« toast ») — dire ce qui vient de se passer, puis
 * s'effacer seul (audit du 15/10/2026, T7).
 *
 * Le succès s'annonçait de cinq façons : ce bandeau rangé dans les écrans
 * d'admin de l'app (`DecisionToast`), une `Notice` verte, un texte vert, une
 * `Alert` « OK », une annonce au seul lecteur d'écran. Il entre dans le
 * design system, avec :
 * - une vibration de succès (`haptic('success')`), d'erreur pour un échec ;
 * - un « Annuler » optionnel (`undo`), qui reste 10 s (`TOAST_ACTION_MS`) ;
 * - un geste en cours (« Annulation… », `pending`) qui attend sa réponse.
 *
 * DEUX façons de s'en servir :
 * 1. GLOBALE (le cas courant) : l'app monte `<ToastHost />` une fois à la
 *    racine ; n'importe quel écran appelle `showToast('Commentaire publié.')`
 *    ou `showToast('Supprimé.', { undo: restore })`. Sous une pilule
 *    d'onglets flottante, l'écran remonte le bandeau (`setToastOffset`).
 * 2. LOCALE (un écran qui positionne son bandeau lui-même, ex. dans une
 *    feuille) : `const { toast, show } = useToast()` + `<Toast toast={toast} />`.
 *
 * Pas de jumeau web pour l'instant : le web confirme par `AlertBanner` et
 * par le retour de ses formulaires ; à ajouter quand un écran web en aura
 * besoin (règle de parité, AGENTS.md du DS).
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dsT } from '../i18n/store';
import { Icon } from '../icons/generated/native';
import { buildToast, toastHaptic, type ToastExtra, type ToastState } from '../lib/toast-model';
import { toastLifetimeMs } from '../lib/toast-lifetime';
import { Button, radius, spacing, useE237Colors, useNeu } from './core';
import { haptic } from './haptics';
import { Txt } from './text';

export type { ToastAction, ToastExtra, ToastState } from '../lib/toast-model';
export { TOAST_ACTION_MS, TOAST_MS, toastLifetimeMs } from '../lib/toast-lifetime';

/* ------------------------------------------------------------------ */
/* Bandeau LOCAL                                                       */
/* ------------------------------------------------------------------ */

/**
 * Un bandeau tenu par l'écran : `show(message, extra?)` l'affiche (et vibre),
 * `hide()` le retire. Il s'efface seul selon `toastLifetimeMs`.
 */
export function useToast(): {
  toast: ToastState | null;
  show: (message: string, extra?: ToastExtra) => void;
  hide: () => void;
} {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const lifetime = toastLifetimeMs(toast);
    if (lifetime === null) return;
    const handle = setTimeout(() => setToast(null), lifetime);
    return () => clearTimeout(handle);
  }, [toast]);

  const hide = useCallback(() => setToast(null), []);

  const show = useCallback(
    (message: string, extra?: ToastExtra) => {
      const kind = toastHaptic(extra);
      if (kind) haptic(kind);
      setToast((previous) => buildToast(message, extra, previous?.id ?? 0, dsT('ui.toast.undo'), hide));
    },
    [hide],
  );

  return { toast, show, hide };
}

/** Le bandeau lui-même ; rien quand `toast` est `null`. */
export function Toast({
  toast,
  bottom,
}: {
  toast: ToastState | null;
  /** Distance au bas de l'écran ; par défaut, juste au-dessus de la zone sûre. */
  bottom?: number;
}) {
  const c = useE237Colors();
  const neu = useNeu();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  return (
    <View
      pointerEvents={toast.action ? 'box-none' : 'none'}
      style={[styles.dock, { bottom: bottom ?? insets.bottom + spacing['4'] }]}
    >
      <Animated.View
        key={toast.id}
        entering={FadeInDown.duration(180)}
        exiting={FadeOutDown.duration(160)}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: c.surfaceRaised, borderColor: c.border }, neu.card]}
      >
        {toast.pending ? (
          <ActivityIndicator size="small" color={c.textMuted} />
        ) : (
          <Icon
            name={toast.failed ? 'alert-triangle' : 'check-circle'}
            color={toast.failed ? c.danger : c.success}
            size={18}
          />
        )}
        <Txt variant="bodyMedium" style={styles.text}>
          {toast.message}
        </Txt>
        {toast.action ? (
          <Button label={toast.action.label} variant="ghost" onPress={toast.action.onPress} style={styles.action} />
        ) : null}
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau GLOBAL                                                      */
/* ------------------------------------------------------------------ */

let current: ToastState | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let offset: number | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Retire le bandeau global (sans attendre son échéance). */
export function hideToast(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (current === null) return;
  current = null;
  emit();
}

/**
 * Affiche le bandeau global (monté par `<ToastHost />`) et vibre.
 *
 * @example
 * showToast(t('feed.comment.posted'));
 * showToast(t('shop.favorites.removed'), { undo: () => void restoreFavorite(id) });
 * showToast(t('common.notSaved'), { failed: true });
 */
export function showToast(message: string, extra?: ToastExtra): void {
  const kind = toastHaptic(extra);
  if (kind) haptic(kind);
  if (timer) clearTimeout(timer);
  timer = null;
  current = buildToast(message, extra, current?.id ?? 0, dsT('ui.toast.undo'), hideToast);
  const lifetime = toastLifetimeMs(current);
  if (lifetime !== null) timer = setTimeout(hideToast, lifetime);
  emit();
}

/**
 * Distance du bandeau global au bas de l'écran, posée par l'écran visible
 * (un onglet sous la pilule flottante : `tabBarReserve(insets.bottom)`) ;
 * `null` rend la position par défaut.
 */
export function setToastOffset(bottom: number | null): void {
  if (offset === bottom) return;
  offset = bottom;
  emit();
}

const getCurrent = () => current;
const getOffset = () => offset;

/** Le bandeau global : à monter UNE fois, à la racine de l'app, au-dessus des écrans. */
export function ToastHost({ bottom }: { bottom?: number }) {
  const toast = useSyncExternalStore(subscribe, getCurrent, getCurrent);
  const screenOffset = useSyncExternalStore(subscribe, getOffset, getOffset);
  return <Toast toast={toast} bottom={screenOffset ?? bottom} />;
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: spacing['4'], right: spacing['4'] },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  text: { flex: 1 },
  // Le bouton fantôme garde sa cible de 44 px ; le bandeau ne grandit pas.
  action: { marginVertical: -spacing['2'], marginRight: -spacing['2'] },
});
