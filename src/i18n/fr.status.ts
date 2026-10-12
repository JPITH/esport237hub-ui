/** Statuts : duel, litige, commande, événement, compétition, paiement, salle. */
export const frStatus = {
  // Duel (cahier §05) : générique, puis vu du joueur connecté. Copie du
  // vocabulaire de `@esport237hub/types` (`duel-status-view.ts`), gardée
  // identique par `lib/duel-status.test.ts` (le design system ne dépend de
  // `types` que pour ses types).
  'status.duel.draft': 'Brouillon',
  'status.duel.sent': 'Défi en attente',
  'status.duel.accepted': 'Accepté',
  'status.duel.venue_pending': 'Salle en attente',
  'status.duel.scheduled': 'Programmé',
  'status.duel.checkin_open': 'Check-in ouvert',
  'status.duel.in_progress': 'En cours',
  'status.duel.result_submitted': 'Score déclaré',
  'status.duel.under_review': 'En validation',
  'status.duel.validated': 'Validé',
  'status.duel.disputed': 'Contesté',
  'status.duel.cancelled': 'Annulé',
  'status.duelView.answer_challenge': 'Défi reçu',
  'status.duelView.await_answer': 'Défi envoyé',
  'status.duelView.await_taker': 'Défi ouvert',
  'status.duelView.pick_place': 'À organiser',
  'status.duelView.await_venue_reply': 'Salle en attente',
  'status.duelView.validate_venue': 'Salle à valider',
  'status.duelView.await_venue_ok': 'Salle proposée',
  'status.duelView.pay_share': 'Part à payer',
  'status.duelView.await_payment': 'Paiement en attente',
  'status.duelView.await_payment_confirmation': 'Paiement en attente',
  'status.duelView.await_match_time': 'Programmé',
  'status.duelView.open_checkin': 'Check-in à ouvrir',
  'status.duelView.play_in_app': 'À jouer',
  'status.duelView.do_checkin': 'Check-in à faire',
  'status.duelView.await_checkin': 'Check-in fait',
  'status.duelView.report_score': 'Score à envoyer',
  'status.duelView.confirm_score': 'Score à confirmer',
  'status.duelView.await_confirmation': 'Score envoyé',
  'status.duelView.await_review': 'En validation',
  'status.duelView.await_dispute': 'Contesté',
  'status.duelView.done': 'Validé',
  'status.duelView.cancelled': 'Annulé',

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
