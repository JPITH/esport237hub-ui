import type { frRanking } from './fr.ranking';

export const enRanking: Record<keyof typeof frRanking, string> = {
  'ranking.live_status.live': 'Live',
  'ranking.live_status.connecting': 'Connecting to live…',
  'ranking.live_status.offline': 'Offline',

  'ranking.movement.stable': 'No change',
  'ranking.movement.up_one': 'Up {n} place',
  'ranking.movement.up_other': 'Up {n} places',
  'ranking.movement.down_one': 'Down {n} place',
  'ranking.movement.down_other': 'Down {n} places',

  'ranking.division_movement.same': 'Division {division}',
  'ranking.division_movement.up': 'Promoted to {division}',
  'ranking.division_movement.down': 'Relegated to {division}',

  'ranking.scope_label.season': 'Season',
  'ranking.scope_label.national': 'National',
  'ranking.scope_hint.season': 'Points earned this month. Divisions are decided here.',
  'ranking.scope_hint.national': 'Your position among all players. Independent of your division.',

  'ranking.duels_until_ranked_one': 'One more duel to get ranked this season',
  'ranking.duels_until_ranked_other': '{n} more duels to get ranked this season',
  'ranking.season_remaining.ended': 'Season ended',
  'ranking.season_remaining.last_day': 'Last day',
  'ranking.season_remaining.days': '{days} days left',

  'ranking.season_result.in_progress': 'Season in progress',
  'ranking.season_result.unranked': 'Unranked',
  'ranking.rollover.promoted': 'Promoted',
  'ranking.rollover.relegated': 'Relegated',
  'ranking.rollover.stayed': 'Held',

  'ranking.season_state.upcoming': 'Upcoming',
  'ranking.season_state.live': 'Live',
  'ranking.season_state.ended': 'Ended',
  'ranking.season_state.closed': 'Standings locked',
  'ranking.progress_aria': '{name} progress',

  'rating.label.poor': 'Avoid',
  'rating.label.disappointing': 'Disappointing',
  'rating.label.fair': 'Decent',
  'rating.label.great': 'Great',
  'rating.label.excellent': 'Excellent',
  'rating.count.none': 'No reviews',
  'rating.count.value': '{n} reviews',

  'rating.axis.equipment.label': 'Equipment',
  'rating.axis.equipment.hint': 'Controllers, screens, consoles',
  'rating.axis.connection.label': 'Connection',
  'rating.axis.connection.hint': 'Speed and stability',
  'rating.axis.comfort.label': 'Comfort',
  'rating.axis.comfort.hint': 'Space, seating, cleanliness',
  'rating.axis.staff.label': 'Staff',
  'rating.axis.staff.hint': 'Staff and organisation',

  'rating.gate.open': 'Share your thoughts on this venue.',
  'rating.gate.needs_account': 'Sign in to review this venue.',
  'rating.gate.needs_paid_session':
    'Reviews are reserved for players who paid for a session or a subscription here. Play a session and you can rate the venue right after.',
  'rating.gate.closed': 'Reviews are closed for this venue.',

  'rating.summary.not_rated': 'Not rated yet',
  'rating.summary.value_of_max': '{value} out of {max}',
  'rating.summary.empty':
    'No one has rated this venue yet. Play a session here and be the first to leave a review.',
  'rating.input.choose': 'Choose a rating',
  'rating.review.played_here': 'Played here',
};
