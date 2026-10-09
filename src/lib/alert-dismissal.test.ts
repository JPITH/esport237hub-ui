import { describe, expect, it } from 'bun:test';

import {
  ALERT_DISMISSAL_KEY,
  ALERT_DISMISSAL_MAX,
  alertSignature,
  isAlertDismissed,
  parseDismissed,
  readDismissed,
  withDismissed,
  writeDismissed,
  type AlertStorage,
} from './alert-dismissal';

/** Un stockage en mémoire, comme `localStorage`. */
function memoryStorage(): AlertStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

/** Un stockage qui refuse tout (navigation privée, stockage bloqué). */
const brokenStorage: AlertStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('alertSignature — repérer qu’un message a changé', () => {
  it('est stable pour un même texte, même mis en forme autrement', () => {
    expect(alertSignature('Paiement en attente : 2 000 FCFA')).toBe(
      alertSignature('  Paiement   en attente :\n2 000 FCFA '),
    );
  });

  it('change quand le texte change (un autre montant fait revenir l’alerte)', () => {
    expect(alertSignature('Paiement en attente : 2 000 FCFA')).not.toBe(
      alertSignature('Paiement en attente : 5 000 FCFA'),
    );
  });
});

describe('la mémoire des alertes fermées', () => {
  it('une alerte fermée reste fermée pour CE contenu, pas pour un autre', () => {
    const sig = alertSignature('Choisis tes jeux');
    const after = withDismissed({}, 'choose-games', sig);
    expect(isAlertDismissed(after, 'choose-games', sig)).toBe(true);
    expect(isAlertDismissed(after, 'choose-games', alertSignature('Autre texte'))).toBe(false);
    expect(isAlertDismissed(after, 'pending-payment', sig)).toBe(false);
  });

  it('survit au rechargement : écrite puis relue dans le stockage', () => {
    const storage = memoryStorage();
    const sig = alertSignature('Duel à traiter');
    expect(writeDismissed(storage, withDismissed({}, 'duel', sig))).toBe(true);
    expect(storage.data.has(ALERT_DISMISSAL_KEY)).toBe(true);
    expect(isAlertDismissed(readDismissed(storage), 'duel', sig)).toBe(true);
  });

  it('ne lève JAMAIS : stockage absent, bloqué ou plein → mémoire vide, écriture refusée', () => {
    expect(readDismissed(null)).toEqual({});
    expect(readDismissed(brokenStorage)).toEqual({});
    expect(writeDismissed(brokenStorage, { a: 'x' })).toBe(false);
    expect(writeDismissed(undefined, { a: 'x' })).toBe(false);
  });

  it('ignore un contenu corrompu au lieu de planter', () => {
    expect(parseDismissed('{pas du json')).toEqual({});
    expect(parseDismissed('[1,2,3]')).toEqual({});
    expect(parseDismissed('"texte"')).toEqual({});
    expect(parseDismissed('{"ok":"abc","nombre":3,"":"vide"}')).toEqual({ ok: 'abc' });
  });

  it('reste bornée : les fermetures les plus anciennes sortent', () => {
    let map = {};
    for (let i = 0; i < ALERT_DISMISSAL_MAX + 5; i += 1) {
      map = withDismissed(map, `a${i}`, 'x');
    }
    const ids = Object.keys(map);
    expect(ids).toHaveLength(ALERT_DISMISSAL_MAX);
    expect(ids).not.toContain('a0');
    expect(ids[ids.length - 1]).toBe(`a${ALERT_DISMISSAL_MAX + 4}`);
  });

  it('refermer une alerte la remet en dernière position avec sa nouvelle signature', () => {
    const map = withDismissed(withDismissed({ a: '1', b: '1' }, 'a', '2'), 'c', '1');
    expect(Object.entries(map)).toEqual([
      ['b', '1'],
      ['a', '2'],
      ['c', '1'],
    ]);
  });
});
