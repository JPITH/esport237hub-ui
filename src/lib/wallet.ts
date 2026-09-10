/**
 * Portefeuille — vocabulaire partagé.
 *
 * `sourceLabel` était une table privée de
 * `apps/web/src/components/wallet/wallet-panel.tsx`, et la liste de montants
 * de recharge était écrite deux fois (`recharge-form.tsx` et
 * `apps/mobile/src/app/wallet.tsx`).
 */
import { dsT, type DsKey } from '../i18n/store';

/** Origine d'une opération → clé de libellé lisible par un joueur. */
export const WALLET_SOURCE_LABEL: Record<string, DsKey> = {
  topup: 'money.source.topup',
  duel_booking: 'money.source.roomBooking',
  booking: 'money.source.roomBooking',
  event_ticket: 'money.source.eventTicket',
  payout: 'money.source.payout',
  withdrawal: 'money.source.withdrawal',
  refund: 'money.source.refund',
  adjustment: 'money.source.adjustment',
  shop_purchase: 'money.source.shopPurchase',
  subscription: 'money.source.subscription',
  duel: 'money.source.duel',
};

export function walletSourceLabel(source: string | null | undefined): string {
  if (!source) return dsT('money.source.fallback');
  const key = WALLET_SOURCE_LABEL[source];
  return key ? dsT(key) : source;
}

/** Montants proposés en un clic dans le formulaire de recharge (FCFA). */
export const TOPUP_PRESETS = [1000, 2000, 5000, 10000] as const;
