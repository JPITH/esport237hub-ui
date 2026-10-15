import { describe, expect, it } from 'bun:test';

import { buildToast, toastHaptic } from './toast-model';

describe('buildToast', () => {
  it('numérote chaque bandeau : deux confirmations identiques se relancent', () => {
    const a = buildToast('Enregistré.', undefined, 0, 'Annuler', () => undefined);
    const b = buildToast('Enregistré.', undefined, a.id, 'Annuler', () => undefined);
    expect(b.id).toBe(a.id + 1);
    expect(a.action).toBeUndefined();
  });

  it('« undo » devient « Annuler », qui referme le bandeau AVANT d’annuler', () => {
    const calls: string[] = [];
    const toast = buildToast(
      'Commentaire supprimé.',
      { undo: () => calls.push('undo') },
      3,
      'Annuler',
      () => calls.push('dismiss'),
    );
    expect(toast.action?.label).toBe('Annuler');
    toast.action?.onPress();
    expect(calls).toEqual(['dismiss', 'undo']);
  });

  it('une action explicite l’emporte sur « undo »', () => {
    const onPress = () => undefined;
    const toast = buildToast('x', { action: { label: 'Voir', onPress }, undo: () => undefined }, 0, 'Annuler', () => undefined);
    expect(toast.action).toEqual({ label: 'Voir', onPress });
  });

  it('garde l’état (échec, en cours, durée) sans les réglages de construction', () => {
    const toast = buildToast('x', { failed: true, durationMs: 5000, haptic: false }, 0, 'Annuler', () => undefined);
    expect(toast).toEqual({ id: 1, message: 'x', failed: true, durationMs: 5000 });
  });
});

describe('toastHaptic', () => {
  it('succès par défaut, erreur pour un échec, rien pendant l’attente', () => {
    expect(toastHaptic(undefined)).toBe('success');
    expect(toastHaptic({ failed: true })).toBe('error');
    expect(toastHaptic({ pending: true })).toBeNull();
    expect(toastHaptic({ haptic: false })).toBeNull();
  });
});
