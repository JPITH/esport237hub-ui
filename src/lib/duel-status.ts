import type { DuelStatus } from '@esport237hub/types';

import { dsT, type DsKey } from '../i18n/store';
import type { Tone } from './tone';

/**
 * Libellé français + ton visuel de chaque statut (cahier §05).
 *
 * Trois règles gouvernent cette table, et elles priment sur le goût :
 *
 * 1. **L'accent ne dit jamais un état.** Le vert lime de la marque appartient
 *    aux boutons. Un duel « validé » peint en accent se confondait avec le
 *    bouton « Lancer le duel » posé juste à côté : deux choses de nature
 *    opposée, même couleur. « Validé » est donc en `success` (émeraude).
 * 2. **Une seule famille par intention.** `warning` est réservé aux statuts
 *    qui attendent quelque chose de l'utilisateur ; ce qui avance tout seul
 *    est en `info`. Avant, « Check-in ouvert » (agis maintenant) et
 *    « Résultat soumis » (patiente) portaient le même orange.
 * 3. **`cyan` = en direct.** Un seul statut l'utilise, et c'est ce qui le rend
 *    repérable d'un coup d'œil dans une liste.
 *
 * La table porte une CLÉ de traduction, pas un libellé rendu : un statut de
 * duel s'affiche sur les trois apps, et deux d'entre elles sont bilingues.
 * Passer par `statusLabel()` plutôt que par `.label`.
 */
export const DUEL_STATUS_META: Record<
  DuelStatus,
  { labelKey: DsKey; tone: Tone }
> = {
  draft: { labelKey: 'status.duel.draft', tone: 'neutral' },
  sent: { labelKey: 'status.duel.sent', tone: 'info' },
  accepted: { labelKey: 'status.duel.accepted', tone: 'info' },
  venue_pending: { labelKey: 'status.duel.venue_pending', tone: 'warning' },
  scheduled: { labelKey: 'status.duel.scheduled', tone: 'info' },
  checkin_open: { labelKey: 'status.duel.checkin_open', tone: 'warning' },
  in_progress: { labelKey: 'status.duel.in_progress', tone: 'cyan' },
  result_submitted: { labelKey: 'status.duel.result_submitted', tone: 'warning' },
  under_review: { labelKey: 'status.duel.under_review', tone: 'info' },
  validated: { labelKey: 'status.duel.validated', tone: 'success' },
  disputed: { labelKey: 'status.duel.disputed', tone: 'danger' },
  cancelled: { labelKey: 'status.duel.cancelled', tone: 'neutral' },
};

export function statusLabel(status: DuelStatus): string {
  const key = DUEL_STATUS_META[status]?.labelKey;
  return key ? dsT(key) : status;
}

/**
 * Statuts d'un litige — miroir de la contrainte CHECK de `duel_disputes`
 * (supabase/migrations/0001_initial_schema.sql).
 */
export const DISPUTE_STATUSES = [
  'open',
  'under_review',
  'resolved',
  'rejected',
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/** Clé de libellé + ton visuel de chaque statut de litige. */
export const DISPUTE_STATUS_META: Record<
  DisputeStatus,
  { labelKey: DsKey; tone: Tone }
> = {
  open: { labelKey: 'status.dispute.open', tone: 'warning' },
  under_review: { labelKey: 'status.dispute.under_review', tone: 'info' },
  resolved: { labelKey: 'status.dispute.resolved', tone: 'success' },
  rejected: { labelKey: 'status.dispute.rejected', tone: 'neutral' },
};

/** Repli propre : l'API renvoie du texte libre, un statut inconnu reste lisible. */
export function disputeStatusMeta(status: string): {
  label: string;
  tone: Tone;
} {
  const meta = DISPUTE_STATUS_META[status as DisputeStatus];
  return meta
    ? { label: dsT(meta.labelKey), tone: meta.tone }
    : { label: dsT('status.unknown'), tone: 'neutral' };
}
