/**
 * Statuts de commande boutique — libellés FR et tons.
 * Extrait de `apps/web/src/components/shop/order-status.tsx` : la table et la
 * fonction de libellé étaient pures, seul le `Badge` restait du rendu.
 */
import type { OrderStatus } from '@esport237hub/types';

import type { Tone } from './tone';

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: 'neutral',
  paid: 'cyan',
  ready: 'gold',
  collected: 'accent',
  cancelled: 'danger',
};

/**
 * Libellé FR d'un statut de commande. `collected` se lit différemment selon
 * le type de produit : livraison automatique (numérique) ou retrait physique
 * effectivement passé au comptoir (physique).
 */
export function orderStatusLabel(status: OrderStatus, kind?: string): string {
  if (status === 'collected') {
    return kind === 'digital' ? 'Livrée' : 'Retirée en salle';
  }
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'paid':
      return 'Payée';
    case 'ready':
      return 'Prête — à retirer en salle';
    case 'cancelled':
      return 'Annulée';
    default:
      return status;
  }
}
