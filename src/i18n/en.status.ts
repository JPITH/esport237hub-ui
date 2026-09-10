import type { frStatus } from './fr.status';

export const enStatus: Record<keyof typeof frStatus, string> = {
  'status.duel.draft': 'Draft',
  'status.duel.sent': 'Sent',
  'status.duel.accepted': 'Accepted',
  'status.duel.venue_pending': 'Awaiting venue',
  'status.duel.scheduled': 'Scheduled',
  'status.duel.checkin_open': 'Check-in open',
  'status.duel.in_progress': 'In progress',
  'status.duel.result_submitted': 'Result submitted',
  'status.duel.under_review': 'Under review',
  'status.duel.validated': 'Validated',
  'status.duel.disputed': 'Disputed',
  'status.duel.cancelled': 'Cancelled',

  'status.dispute.open': 'Open',
  'status.dispute.under_review': 'Under review',
  'status.dispute.resolved': 'Resolved',
  'status.dispute.rejected': 'Rejected',
  'status.unknown': 'Unknown status',

  'status.order.pending': 'Pending',
  'status.order.paid': 'Paid',
  'status.order.ready': 'Ready — collect at the venue',
  'status.order.collected': 'Collected at the venue',
  'status.order.delivered': 'Delivered',
  'status.order.cancelled': 'Cancelled',
};
