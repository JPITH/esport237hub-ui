import type { frMoney } from './fr.money';

export const enMoney: Record<keyof typeof frMoney, string> = {
  'money.source.topup': 'Top-up',
  'money.source.roomBooking': 'Venue booking',
  'money.source.eventTicket': 'Event ticket',
  'money.source.payout': 'Payout',
  'money.source.withdrawal': 'Withdrawal',
  'money.source.refund': 'Refund',
  'money.source.adjustment': 'Adjustment',
  'money.source.shopPurchase': 'Shop purchase',
  'money.source.subscription': 'Venue subscription',
  'money.source.duel': 'Duel',
  'money.source.fallback': 'Transaction',

  'money.payout.net': 'Revenue',
  'money.payout.payable': 'Payable',
  'money.payout.processing': 'Processing…',
  'money.payout.collect': 'Collect {amount}',
  'money.payout.upToDate': 'Up to date — nothing to pay out.',
};
