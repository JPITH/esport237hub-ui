/**
 * Statuts de commande boutique — libellés et tons. LA table, et la seule
 * (08/10/2026) : il en existait quatre, contradictoires — le web, la console
 * du gérant, le mobile et celle-ci, qui peignait « retirée » en `accent` et
 * « prête » en `gold`.
 *
 * Les tons suivent le barème de UX.md (« Le parcours dicte la couleur ») :
 *
 * | Statut      | Ton       | Ce que ça veut dire                            |
 * |-------------|-----------|------------------------------------------------|
 * | `pending`   | `warning` | agis : la commande attend son paiement         |
 * | `paid`      | `info`    | patiente : la salle prépare                    |
 * | `ready`     | `warning` | agis : c'est prêt, va le chercher              |
 * | `collected` | `success` | c'est acquis (retirée ou livrée)               |
 * | `cancelled` | `neutral` | rien à faire — pas un échec du joueur          |
 *
 * Jamais `accent` : l'accent est interactif, il ne dit JAMAIS un état
 * (DESIGN.md, couche 2) — `order-status.test.ts` le vérifie. Jamais `gold` non
 * plus : il est décoratif (podium). L'app mobile garde ses « étapes » de
 * lecture, plus fines (`apps/mobile/src/lib/shop-orders.ts`), mais en tire ses
 * tons d'ici.
 */
import type { OrderStatus } from '@esport237hub/types';

import { dsT } from '../i18n/store';
import type { Tone } from './tone';

export const ORDER_STATUS_TONE: Readonly<Record<OrderStatus, Tone>> = {
  pending: 'warning',
  paid: 'info',
  ready: 'warning',
  collected: 'success',
  cancelled: 'neutral',
};

/** Ton d'un statut — tolérant : un statut ajouté demain en base reste neutre. */
export function orderStatusTone(status: string): Tone {
  return (ORDER_STATUS_TONE as Record<string, Tone>)[status] ?? 'neutral';
}

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
