/**
 * Pont haptique optionnel — l'app mobile enregistre un handler (expo-haptics).
 * Sans enregistrement : no-op (web, tests, storybook).
 */

export type HapticKind =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'warning';

type HapticHandler = (kind: HapticKind) => void;

let handler: HapticHandler | null = null;

/** Enregistré une fois au boot de l'app mobile. */
export function setNativeHaptics(fn: HapticHandler | null): void {
  handler = fn;
}

/** Déclenche un retour haptique si un handler est branché. */
export function haptic(kind: HapticKind = 'light'): void {
  try {
    handler?.(kind);
  } catch {
    /* ignore — jamais bloquer l'UI */
  }
}
