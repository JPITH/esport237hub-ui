/**
 * Combien de temps un bandeau de confirmation (`Toast`, `./native/toast`)
 * reste à l'écran — la règle, sans React, pour qu'un test la tienne.
 *
 * Venue de l'app mobile (`apps/mobile/src/lib/toast-lifetime.ts`, qui la
 * ré-exporte) quand le bandeau est entré dans le design system (15/10/2026).
 *
 * - un geste EN COURS (« Annulation… ») reste jusqu'à sa réponse : il
 *   s'effacerait sinon avant de dire si l'annulation a pris ;
 * - un bandeau qui porte une action reste le temps que l'appelant donne
 *   (le comptoir : la fenêtre d'annulation de l'API, 2 min, comme le web),
 *   à défaut le temps de lire PUIS de toucher ;
 * - sinon, le temps de lire une phrase.
 */

/** Assez pour lire une phrase, pas assez pour masquer la carte suivante. */
export const TOAST_MS = 4000;
/** Avec une action, sans durée donnée : le temps de lire PUIS de toucher. */
export const TOAST_ACTION_MS = 10_000;

export function toastLifetimeMs(toast: {
  pending?: boolean;
  action?: unknown;
  durationMs?: number;
}): number | null {
  if (toast.pending) return null;
  if (toast.durationMs !== undefined) return toast.durationMs;
  return toast.action ? TOAST_ACTION_MS : TOAST_MS;
}
