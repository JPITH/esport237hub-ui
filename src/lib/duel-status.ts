import type { DuelStatus } from '@esport237hub/types';

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
 */
export const DUEL_STATUS_META: Record<
  DuelStatus,
  { label: string; tone: Tone }
> = {
  draft: { label: 'Brouillon', tone: 'neutral' },
  sent: { label: 'Envoyée', tone: 'info' },
  accepted: { label: 'Acceptée', tone: 'info' },
  venue_pending: { label: 'Salle en attente', tone: 'warning' },
  scheduled: { label: 'Programmée', tone: 'info' },
  checkin_open: { label: 'Check-in ouvert', tone: 'warning' },
  in_progress: { label: 'En cours', tone: 'cyan' },
  result_submitted: { label: 'Résultat soumis', tone: 'warning' },
  under_review: { label: 'En validation', tone: 'info' },
  validated: { label: 'Validé', tone: 'success' },
  disputed: { label: 'Contesté', tone: 'danger' },
  cancelled: { label: 'Annulé', tone: 'neutral' },
};

export function statusLabel(status: DuelStatus): string {
  return DUEL_STATUS_META[status]?.label ?? status;
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

/** Libellé français + ton visuel de chaque statut de litige. */
export const DISPUTE_STATUS_META: Record<
  DisputeStatus,
  { label: string; tone: Tone }
> = {
  open: { label: 'Ouvert', tone: 'warning' },
  under_review: { label: 'En examen', tone: 'info' },
  resolved: { label: 'Résolu', tone: 'success' },
  rejected: { label: 'Rejeté', tone: 'neutral' },
};

/** Repli propre : l'API renvoie du texte libre, un statut inconnu reste lisible. */
export function disputeStatusMeta(status: string): {
  label: string;
  tone: Tone;
} {
  return (
    DISPUTE_STATUS_META[status as DisputeStatus] ?? {
      label: 'Statut inconnu',
      tone: 'neutral',
    }
  );
}
