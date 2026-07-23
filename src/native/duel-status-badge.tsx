import type { DuelStatus } from '@esport237hub/types';
import { Badge } from './core';

import { DUEL_STATUS_META } from '../lib/duel-status';

/** Pastille colorée du statut d'un duel (12 statuts, cahier §05). */
export function DuelStatusBadge({ status }: { status: DuelStatus }) {
  const meta = DUEL_STATUS_META[status];
  return <Badge tone={meta?.tone ?? 'neutral'}>{meta?.label ?? status}</Badge>;
}
