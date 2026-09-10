/** Statuts : duel, litige, commande, événement, compétition, paiement, salle. */
export const frStatus = {
  // Duel (cahier §05)
  'status.duel.draft': 'Brouillon',
  'status.duel.sent': 'Envoyée',
  'status.duel.accepted': 'Acceptée',
  'status.duel.venue_pending': 'Salle en attente',
  'status.duel.scheduled': 'Programmée',
  'status.duel.checkin_open': 'Check-in ouvert',
  'status.duel.in_progress': 'En cours',
  'status.duel.result_submitted': 'Résultat soumis',
  'status.duel.under_review': 'En validation',
  'status.duel.validated': 'Validé',
  'status.duel.disputed': 'Contesté',
  'status.duel.cancelled': 'Annulé',

  // Litige
  'status.dispute.open': 'Ouvert',
  'status.dispute.under_review': 'En examen',
  'status.dispute.resolved': 'Résolu',
  'status.dispute.rejected': 'Rejeté',
  'status.unknown': 'Statut inconnu',

  // Commande boutique
  'status.order.pending': 'En attente',
  'status.order.paid': 'Payée',
  'status.order.ready': 'Prête — à retirer en salle',
  'status.order.collected': 'Retirée en salle',
  'status.order.delivered': 'Livrée',
  'status.order.cancelled': 'Annulée',
} as const;
