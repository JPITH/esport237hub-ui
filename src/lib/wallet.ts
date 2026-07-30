/**
 * Portefeuille — vocabulaire partagé.
 *
 * `sourceLabel` était une table privée de
 * `apps/web/src/components/wallet/wallet-panel.tsx`, et la liste de montants
 * de recharge était écrite deux fois (`recharge-form.tsx` et
 * `apps/mobile/src/app/wallet.tsx`).
 */

/** Origine d'une opération → libellé lisible par un joueur. */
export const WALLET_SOURCE_LABEL: Record<string, string> = {
  topup: 'Recharge',
  duel_booking: 'Réservation de salle',
  booking: 'Réservation de salle',
  event_ticket: "Billet d'événement",
  payout: 'Reversement',
  withdrawal: 'Retrait',
  refund: 'Remboursement',
  adjustment: 'Ajustement',
  shop_purchase: 'Achat boutique',
  subscription: 'Abonnement salle',
  duel: 'Duel',
};

export function walletSourceLabel(source: string | null | undefined): string {
  if (!source) return 'Opération';
  return WALLET_SOURCE_LABEL[source] ?? source;
}

/** Montants proposés en un clic dans le formulaire de recharge (FCFA). */
export const TOPUP_PRESETS = [1000, 2000, 5000, 10000] as const;
