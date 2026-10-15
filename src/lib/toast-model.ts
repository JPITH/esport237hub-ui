/**
 * Le bandeau de confirmation (`Toast`, `./native/toast`) sans React : ce
 * qu'il porte, comment un « Annuler » se construit, et quel retour haptique
 * l'accompagne. Pur et testé (`toast-model.test.ts`).
 */

/** Un geste proposé dans le bandeau — un seul, court (« Annuler »). */
export interface ToastAction {
  label: string;
  onPress: () => void;
}

/** Ce qu'un bandeau peut porter en plus de son texte. */
export interface ToastExtra {
  /** Un geste quelconque ; l'appelant gère la suite (« Annulation… » en `pending`). */
  action?: ToastAction;
  /**
   * Raccourci d'« Annuler » : le bouton (libellé du DS) referme le bandeau
   * PUIS appelle `undo`. Reste 10 s (`TOAST_ACTION_MS`) sauf `durationMs`.
   * Ignoré si `action` est fourni.
   */
  undo?: () => void;
  /** Un geste qui a ÉCHOUÉ ne s'annonce pas avec une coche (icône d'alerte, vibration d'erreur). */
  failed?: boolean;
  /** Un geste EN COURS (« Annulation… ») : un indicateur, et le bandeau attend la réponse. */
  pending?: boolean;
  /** Durée d'affichage, si l'action vaut plus longtemps que le défaut (`toastLifetimeMs`). */
  durationMs?: number;
  /** `false` : pas de vibration (un bandeau qui en remplace un autre). Défaut : oui. */
  haptic?: boolean;
}

export interface ToastState {
  /** Change à chaque bandeau : deux confirmations identiques se relancent. */
  id: number;
  message: string;
  action?: ToastAction;
  failed?: boolean;
  pending?: boolean;
  durationMs?: number;
}

/**
 * Le bandeau à afficher. `undo` devient une action « Annuler » qui referme
 * d'abord le bandeau (`dismiss`) : un second appui ne peut pas repartir.
 */
export function buildToast(
  message: string,
  extra: ToastExtra | undefined,
  previousId: number,
  undoLabel: string,
  dismiss: () => void,
): ToastState {
  const { undo, haptic: _haptic, action, ...rest } = extra ?? {};
  void _haptic;
  const resolved: ToastAction | undefined =
    action ??
    (undo
      ? {
          label: undoLabel,
          onPress: () => {
            dismiss();
            undo();
          },
        }
      : undefined);
  return { id: previousId + 1, message, ...rest, ...(resolved ? { action: resolved } : null) };
}

/** Le retour haptique d'un bandeau : succès, erreur, ou rien pour un geste en cours. */
export function toastHaptic(extra: ToastExtra | undefined): 'success' | 'error' | null {
  if (extra?.haptic === false || extra?.pending) return null;
  return extra?.failed ? 'error' : 'success';
}
