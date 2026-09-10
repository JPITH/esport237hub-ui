import type { frCatalog } from './fr.catalog';

export const enCatalog: Record<keyof typeof frCatalog, string> = {
  'catalog.audit.action.duelValidate': 'Duel validated',
  'catalog.audit.action.duelCancel': 'Duel cancelled',
  'catalog.audit.action.duelDispute': 'Dispute opened',
  'catalog.audit.action.duelResolve': 'Dispute settled',
  'catalog.audit.action.venueVerify': 'Venue verified',
  'catalog.audit.action.venueReject': 'Venue rejected',
  'catalog.audit.action.venueSuspend': 'Venue suspended',
  'catalog.audit.action.pointsRecompute': 'Points recalculated',
  'catalog.audit.action.divisionUpdate': 'Division updated',
  'catalog.audit.action.gameUpdate': 'Game updated',
  'catalog.audit.action.userSuspend': 'Account suspended',
  'catalog.audit.action.payoutApprove': 'Payout approved',

  'catalog.audit.object.duel': 'Duel',
  'catalog.audit.object.venue': 'Venue',
  'catalog.audit.object.season': 'Season',
  'catalog.audit.object.division': 'Division',
  'catalog.audit.object.game': 'Game',
  'catalog.audit.object.user': 'Account',
  'catalog.audit.object.payout': 'Payout',
  'catalog.audit.object.event': 'Event',

  'catalog.audit.actor.admin': 'Admin',
  'catalog.audit.actor.system': 'Automatic',
  'catalog.audit.actor.venue': 'Venue',
  'catalog.audit.actor.player': 'Player',

  'catalog.eventType.tournament': 'Tournament',
  'catalog.eventType.meetup': 'Meetup',
  'catalog.eventType.watchParty': 'Watch party',
  'catalog.eventType.showcase': 'Showcase',
  'catalog.eventType.other': 'Other',

  'catalog.eventStatus.draft': 'Draft',
  'catalog.eventStatus.published': 'Published',
  'catalog.eventStatus.cancelled': 'Cancelled',
  'catalog.eventStatus.finished': 'Finished',

  'catalog.competitionFormat.singleElimination': 'Single elimination',
  'catalog.competitionFormat.doubleElimination': 'Double elimination',
  'catalog.competitionFormat.roundRobin': 'Round robin',
  'catalog.competitionFormat.groupsPlayoffs': 'Groups + playoffs',
  'catalog.competitionFormat.swiss': 'Swiss system',

  'catalog.competitionStatus.ongoing': 'Ongoing',
  'catalog.competitionStatus.upcoming': 'Upcoming',
  'catalog.competitionStatus.finished': 'Finished',

  'catalog.ticketStatus.paid': 'Paid',
  'catalog.ticketStatus.reserved': 'Pay at the venue',
  'catalog.ticketStatus.cancelled': 'Cancelled',
  'catalog.ticketStatus.refunded': 'Refunded',

  'catalog.subscriptionStatus.pendingPayment': 'Awaiting payment',
  'catalog.subscriptionStatus.active': 'Active',
  'catalog.subscriptionStatus.exhausted': 'Exhausted',
  'catalog.subscriptionStatus.expired': 'Expired',
  'catalog.subscriptionStatus.cancelled': 'Cancelled',

  'catalog.platform.ps5': 'PS5',
  'catalog.platform.ps4': 'PS4',
  'catalog.platform.xbox': 'Xbox',
  'catalog.platform.pc': 'PC',
  'catalog.platform.mobile': 'Mobile',
};
