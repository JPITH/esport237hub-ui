import type { frUi } from './fr.ui';

export const enUi: Record<keyof typeof frUi, string> = {
  'ui.card.wins': 'WINS',
  'ui.player.verified': 'Verified player',

  'ui.tab.accueil': 'Home',
  'ui.tab.salles': 'Venues',
  'ui.tab.duels': 'Duels',
  'ui.tab.evenements': 'Events',
  'ui.tab.boutique': 'Shop',

  'ui.loading': 'Loading…',
  'ui.previous': 'Back',
  'ui.previousPage': 'Previous page',
  'ui.online': 'Online',
  'ui.inVenue': 'At a venue',
  'ui.openOpponent': 'open opponent',
  'ui.waiting': 'Waiting',
  'ui.winner': 'Winner',

  'ui.time.now': 'just now',
  'ui.time.minutes': '{n} min ago',
  'ui.time.hours': '{n} h ago',
  'ui.time.yesterday': 'yesterday',
  'ui.time.days': '{n} d ago',

  'ui.media.preparing': 'Preparing the upload…',
  'ui.media.uploading': 'Uploading the photo…',
  'ui.media.checking': 'Checking the file…',
  'ui.media.processing': 'Processing the image…',
  'ui.media.done': 'Done',
  'ui.media.badFormat': 'Format not accepted: pick a JPEG, PNG or WebP image.',
  'ui.media.empty': 'This file is empty.',

  'ui.stat.defense': 'Defence',
  'ui.stat.elixir': 'Elixir',
  'ui.stat.trophies': 'Trophies',
  'ui.stat.consistency': 'Consistency',
  'ui.stat.accuracy': 'Accuracy',
  'ui.stat.reflexes': 'Reflexes',
};
