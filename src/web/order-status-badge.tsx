"use client";

import type { ReactNode } from "react";
import type { OrderStatus } from "@esport237hub/types";

import { orderStatusLabel, orderStatusTone } from "../lib/order-status";
import { Badge } from "./foundation";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** Type de produit — change la lecture de `collected` (livrée / retirée). */
  kind?: string;
  /**
   * Libellé propre à un écran (la console du gérant dit « Réservée » d'une
   * commande à payer au comptoir). Le TON, lui, reste celui de la table.
   */
  label?: ReactNode;
  className?: string;
}

/** Pilule d'état d'une commande boutique (libellés dans `lib/order-status`). */
export function OrderStatusBadge({
  status,
  kind,
  label,
  className,
}: OrderStatusBadgeProps) {
  return (
    <Badge tone={orderStatusTone(status)} className={className}>
      {label ?? orderStatusLabel(status, kind)}
    </Badge>
  );
}
