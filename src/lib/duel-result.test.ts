import { describe, expect, it } from 'bun:test';

import { DUEL_RESULT_META, duelResultLabel, duelResultTone } from './duel-result';

describe('DUEL_RESULT_META — la pastille du gagnant en vert, du perdant en rouge', () => {
  it('victoire en success, défaite en danger, nul en info', () => {
    expect(duelResultTone('win')).toBe('success');
    expect(duelResultTone('loss')).toBe('danger');
    expect(duelResultTone('draw')).toBe('info');
  });

  it('jamais l’accent (interactif) ni l’or (décoratif) pour une issue', () => {
    for (const meta of Object.values(DUEL_RESULT_META)) {
      expect(meta.tone).not.toBe('accent');
      expect(meta.tone).not.toBe('gold');
    }
  });

  it('chaque issue a son mot : la couleur n’est jamais le seul signal', () => {
    expect(duelResultLabel('win')).toBe('Victoire');
    expect(duelResultLabel('loss')).toBe('Défaite');
    expect(duelResultLabel('draw')).toBe('Match nul');
  });
});
