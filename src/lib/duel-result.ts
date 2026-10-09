import type { DuelSideResult } from '@esport237hub/types';

import { dsT, type DsKey } from '../i18n/store';
import type { Tone } from './tone';

/**
 * L'issue d'un duel TERMINÉ, telle que la portent ses pastilles — la même
 * table pour le web et le natif (UX.md, « une seule table »).
 *
 * Retour du porteur (08/10/2026) : « sur la défaite, l'affichage etc : mettre
 * la pill du gagnant en vert et du perdant en rouge ». La couche 3 de
 * DESIGN.md le permet telle quelle : `success` dit « gagné », `danger` dit
 * « perdu ». Trois règles tiennent toujours :
 *
 * 1. **L'accent ne dit jamais l'issue.** Le lime de la marque reste aux
 *    boutons ; une victoire est émeraude (`success`), pas « bouton ».
 * 2. **La couleur n'est jamais le seul signal.** Chaque pastille porte son
 *    mot (« Victoire », « Défaite », « Match nul ») et, quand il est connu, le
 *    score : un daltonien lit l'issue sans la couleur.
 * 3. **Un nul n'est ni l'un ni l'autre** : `info`, le ton de « rien à faire ».
 *
 * Passer par `duelResultLabel()` plutôt que par la clé : deux apps sont
 * bilingues.
 */
export const DUEL_RESULT_META: Record<DuelSideResult, { labelKey: DsKey; tone: Tone }> = {
  win: { labelKey: 'ui.result.win', tone: 'success' },
  loss: { labelKey: 'ui.result.loss', tone: 'danger' },
  draw: { labelKey: 'ui.result.draw', tone: 'info' },
};

/** « Victoire » / « Défaite » / « Match nul » dans la langue en cours. */
export function duelResultLabel(result: DuelSideResult): string {
  return dsT(DUEL_RESULT_META[result].labelKey);
}

/** Le ton d'une issue — `success`, `danger` ou `info`, jamais l'accent. */
export function duelResultTone(result: DuelSideResult): Tone {
  return DUEL_RESULT_META[result].tone;
}
