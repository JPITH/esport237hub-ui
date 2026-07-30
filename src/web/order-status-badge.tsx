"use client";

import type { OrderStatus } from "@esport237hub/types";

import { ORDER_STATUS_TONE, orderStatusLabel } from "../lib/order-status";
import { Badge } from "./foundation";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** Type de produit — change la lecture de `collected` (livrée / retirée). */
  kind?: string;
  className?: string;
}

/** Pilule d'état d'une commande boutique (libellés dans `lib/order-status`). */
export function OrderStatusBadge({
  status,
  kind,
  className,
}: OrderStatusBadgeProps) {
  return (
    <Badge tone={ORDER_STATUS_TONE[status] ?? "neutral"} className={className}>
      {orderStatusLabel(status, kind)}
    </Badge>
  );
}
