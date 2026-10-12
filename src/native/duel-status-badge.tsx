import type { DuelStatus, DuelStatusView } from '@esport237hub/types';
import { Badge } from './core';

import { useDsT } from '../i18n';
import { DUEL_STATUS_META } from '../lib/duel-status';

/**
 * Pastille colorée du statut d'un duel (12 statuts, cahier §05). Avec `view`
 * (`duelStatusView`, vu du joueur connecté), elle dit « Défi reçu » au
 * destinataire et « Défi envoyé » à l'auteur du même défi — jumelle du web.
 */
export function DuelStatusBadge({
  status,
  view,
}: {
  status: DuelStatus;
  view?: Pick<DuelStatusView, 'labelKey' | 'tone'> | null;
}) {
  const t = useDsT();
  const meta = view ?? DUEL_STATUS_META[status];
  return (
    <Badge tone={meta?.tone ?? 'neutral'}>
      {meta ? t(meta.labelKey) : status}
    </Badge>
  );
}
