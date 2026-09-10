/** Fragment « money » — voir src/i18n/fr.ts. */
export const frMoney = {
  // Origine d'une opération de portefeuille
  'money.source.topup': 'Recharge',
  'money.source.roomBooking': 'Réservation de salle',
  'money.source.eventTicket': "Billet d'événement",
  'money.source.payout': 'Reversement',
  'money.source.withdrawal': 'Retrait',
  'money.source.refund': 'Remboursement',
  'money.source.adjustment': 'Ajustement',
  'money.source.shopPurchase': 'Achat boutique',
  'money.source.subscription': 'Abonnement salle',
  'money.source.duel': 'Duel',
  'money.source.fallback': 'Opération',

  // Bloc d'encaissement (PayoutCard)
  'money.payout.net': 'Recette',
  'money.payout.payable': 'À reverser',
  'money.payout.processing': 'Encaissement…',
  'money.payout.collect': 'Encaisser {amount}',
  'money.payout.upToDate': 'À jour — rien à reverser.',
} as const;
