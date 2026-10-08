import { describe, expect, it } from 'bun:test';
import { ORDER_STATUSES } from '@esport237hub/types';

import { ORDER_STATUS_TONE, orderStatusLabel, orderStatusTone } from './order-status';

describe('ORDER_STATUS_TONE — une seule table, fidèle au barème', () => {
  it('couvre chaque statut de commande', () => {
    for (const status of ORDER_STATUSES) expect(ORDER_STATUS_TONE[status]).toBeDefined();
  });

  it('ne dit jamais un état avec l’accent (interactif) ni l’or (décoratif)', () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_TONE[status]).not.toBe('accent');
      expect(ORDER_STATUS_TONE[status]).not.toBe('gold');
    }
  });

  it('ce qui attend un geste en warning, l’acquis en success, l’annulé neutre', () => {
    expect(ORDER_STATUS_TONE.pending).toBe('warning');
    expect(ORDER_STATUS_TONE.ready).toBe('warning');
    expect(ORDER_STATUS_TONE.paid).toBe('info');
    expect(ORDER_STATUS_TONE.collected).toBe('success');
    expect(ORDER_STATUS_TONE.cancelled).toBe('neutral');
  });

  it('un statut inconnu reste neutre, sans planter', () => {
    expect(orderStatusTone('refunded')).toBe('neutral');
    expect(orderStatusTone('ready')).toBe('warning');
  });
});

describe('orderStatusLabel', () => {
  it('« retirée » au comptoir, « livrée » pour un article numérique', () => {
    expect(orderStatusLabel('collected', 'physical')).not.toBe(orderStatusLabel('collected', 'digital'));
  });
});
