import type { DuelStatus } from '@esport237hub/types';

type Tone = 'accent' | 'cyan' | 'gold' | 'danger' | 'warning' | 'neutral';

/** Libellé français + ton visuel de chaque statut (cahier §05). */
export const DUEL_STATUS_META: Record<
  DuelStatus,
  { label: string; tone: Tone }
> = {
  draft: { label: 'Brouillon', tone: 'neutral' },
  sent: { label: 'Envoyée', tone: 'cyan' },
  accepted: { label: 'Acceptée', tone: 'cyan' },
  venue_pending: { label: 'Salle en attente', tone: 'warning' },
  scheduled: { label: 'Programmée', tone: 'cyan' },
  checkin_open: { label: 'Check-in ouvert', tone: 'warning' },
  in_progress: { label: 'En cours', tone: 'accent' },
  result_submitted: { label: 'Résultat soumis', tone: 'warning' },
  under_review: { label: 'En validation', tone: 'warning' },
  validated: { label: 'Validé', tone: 'accent' },
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
  under_review: { label: 'En examen', tone: 'warning' },
  resolved: { label: 'Résolu', tone: 'accent' },
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
