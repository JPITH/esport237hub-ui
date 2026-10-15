import { describe, expect, it } from 'bun:test';

import { TOAST_ACTION_MS, TOAST_MS, toastLifetimeMs } from './toast-lifetime';

describe('toastLifetimeMs — la durée d’un bandeau de confirmation', () => {
  it('un simple constat s’efface après le temps de lecture', () => {
    expect(toastLifetimeMs({})).toBe(TOAST_MS);
  });

  it('une action (« Annuler ») sans durée donnée laisse 10 s pour toucher', () => {
    expect(TOAST_ACTION_MS).toBe(10_000);
    expect(toastLifetimeMs({ action: { label: 'Annuler' } })).toBe(TOAST_ACTION_MS);
  });

  it('une durée donnée par l’appelant l’emporte (fenêtre d’annulation de l’API)', () => {
    expect(toastLifetimeMs({ action: { label: 'Annuler' }, durationMs: 120_000 })).toBe(120_000);
  });

  it('« Annulation… » ne s’efface pas avant la réponse', () => {
    expect(toastLifetimeMs({ pending: true })).toBeNull();
    expect(toastLifetimeMs({ pending: true, durationMs: 1000 })).toBeNull();
  });
});
