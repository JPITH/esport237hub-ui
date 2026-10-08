/**
 * Pilule d'état d'une commande boutique (natif) — jumelle du web.
 * Libellés et tons dans `lib/order-status`.
 */
import type { OrderStatus } from '@esport237hub/types';
import type { StyleProp, ViewStyle } from 'react-native';

import { orderStatusLabel, orderStatusTone } from '../lib/order-status';
import { Badge } from './core';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** Type de produit — change la lecture de `collected` (livrée / retirée). */
  kind?: string;
  /** Libellé propre à un écran ; le TON reste celui de la table. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function OrderStatusBadge({ status, kind, label, style }: OrderStatusBadgeProps) {
  return (
    <Badge tone={orderStatusTone(status)} style={style}>
      {label ?? orderStatusLabel(status, kind)}
    </Badge>
  );
}
