/**
 * Pilule d'état d'une commande boutique (natif) — jumelle du web.
 * Libellés et tons dans `lib/order-status`.
 */
import type { OrderStatus } from '@esport237hub/types';
import type { StyleProp, ViewStyle } from 'react-native';

import { ORDER_STATUS_TONE, orderStatusLabel } from '../lib/order-status';
import { Badge } from './core';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** Type de produit — change la lecture de `collected` (livrée / retirée). */
  kind?: string;
  style?: StyleProp<ViewStyle>;
}

export function OrderStatusBadge({ status, kind, style }: OrderStatusBadgeProps) {
  return (
    <Badge tone={ORDER_STATUS_TONE[status] ?? 'neutral'} style={style}>
      {orderStatusLabel(status, kind)}
    </Badge>
  );
}
