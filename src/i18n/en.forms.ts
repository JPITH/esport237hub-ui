import type { frForms } from './fr.forms';

export const enForms: Record<keyof typeof frForms, string> = {
  'form.field.password.show': 'Show password',
  'form.field.password.hide': 'Hide password',
  'form.field.number.decrease': 'Decrease',
  'form.field.number.increase': 'Increase',
  'form.field.phone.label': 'Phone',
  'form.field.search.placeholder': 'Search…',
  'form.action.clear': 'Clear',
  'form.noResults': 'No results.',

  'form.select.placeholder': 'Choose…',

  'form.date.placeholder': 'Pick a date…',
  'form.date.prevMonth': 'Previous month',
  'form.date.nextMonth': 'Next month',
  'form.date.today': 'Today',
  'form.date.hours': 'Hours',
  'form.date.minutes': 'Minutes',
  'form.date.sheetTitle.date': 'Date',
  'form.date.sheetTitle.time': 'Time',
  'form.date.month.january': 'January',
  'form.date.month.february': 'February',
  'form.date.month.march': 'March',
  'form.date.month.april': 'April',
  'form.date.month.may': 'May',
  'form.date.month.june': 'June',
  'form.date.month.july': 'July',
  'form.date.month.august': 'August',
  'form.date.month.september': 'September',
  'form.date.month.october': 'October',
  'form.date.month.november': 'November',
  'form.date.month.december': 'December',
  'form.date.weekday.mon': 'M',
  'form.date.weekday.tue': 'T',
  'form.date.weekday.wed': 'W',
  'form.date.weekday.thu': 'T',
  'form.date.weekday.fri': 'F',
  'form.date.weekday.sat': 'S',
  'form.date.weekday.sun': 'S',

  'form.tier.groupLabel': 'Ticket tier',
  'form.tier.noDetails': 'No perks or restrictions listed for this tier.',

  'form.skin.lockedSuffix': ' (locked)',

  'form.color.openPicker': 'Open color picker',
  'form.color.hexLabel': 'Hex color',
  'form.color.hue': 'Hue',

  'form.cover.eventAlt': 'Cover art for {title}',
  'form.cover.eventFallback': 'Cover coming soon',
  'form.cover.venueAlt': 'Photo of {name}',
  'form.cover.venueFallback': 'Photo coming soon',
  'form.cover.venueStripLabel': 'Photos of {name}',

  'form.stepper.navLabel': 'Steps',

  'form.table.empty': 'No data.',

  'form.search.placeholder': 'Search players, duels, games, venues…',
  'form.search.dialogLabel': 'Search',
  'form.search.resultsLabel': 'Results',
  'form.search.navigateHint': '↑↓ navigate',
  'form.search.openHint': '↵ open',
  'form.search.closeHint': 'Esc to close',
};
