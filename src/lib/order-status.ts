/**
 * Statuts de commande boutique — libellés FR et tons.
 * Extrait de `apps/web/src/components/shop/order-status.tsx` : la table et la
 * fonction de libellé étaient pures, seul le `Badge` restait du rendu.
 */
import type { OrderStatus } from '@esport237hub/types';

import { dsT } from '../i18n/store';
import type { Tone } from './tone';

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: 'neutral',
  paid: 'cyan',
  ready: 'gold',
  collected: 'accent',
  cancelled: 'danger',
};

/**
 * Libellé d'un statut de commande. `collected` se lit différemment selon le
 * type de produit : livraison automatique (numérique) ou retrait physique
 * effectivement passé au comptoir (physique).
 */
export function orderStatusLabel(status: OrderStatus, kind?: string): string {
  if (status === 'collected') {
    return dsT(kind === 'digital' ? 'status.order.delivered' : 'status.order.collected');
  }
  switch (status) {
    case 'pending':
      return dsT('status.order.pending');
    case 'paid':
      return dsT('status.order.paid');
    case 'ready':
      return dsT('status.order.ready');
    case 'cancelled':
      return dsT('status.order.cancelled');
    default:
      return status;
  }
}
