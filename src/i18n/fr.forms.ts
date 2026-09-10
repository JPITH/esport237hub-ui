/**
 * Fragment « forms » — voir src/i18n/fr.ts.
 * Champs, sélecteurs, calendrier, recherche : les composants de src/web et
 * src/native listés dans la mission (fields, pickers, tier/skin/color
 * pickers, cover-image, stepper, table, global-search).
 */
export const frForms = {
  // Champs (Input mot de passe, NumberInput, PhoneInput/Field, SearchField)
  'form.field.password.show': 'Afficher le mot de passe',
  'form.field.password.hide': 'Masquer le mot de passe',
  'form.field.number.decrease': 'Diminuer',
  'form.field.number.increase': 'Augmenter',
  'form.field.phone.label': 'Téléphone',
  'form.field.search.placeholder': 'Rechercher…',
  'form.action.clear': 'Effacer',
  'form.noResults': 'Aucun résultat.',

  // Select / Combobox (web/pickers.tsx)
  'form.select.placeholder': 'Choisir…',

  // Date / heure (native/date-time.tsx, web/pickers.tsx)
  'form.date.placeholder': 'Choisir une date…',
  'form.date.prevMonth': 'Mois précédent',
  'form.date.nextMonth': 'Mois suivant',
  'form.date.today': 'Aujourd’hui',
  'form.date.hours': 'Heures',
  'form.date.minutes': 'Minutes',
  'form.date.sheetTitle.date': 'Date',
  'form.date.sheetTitle.time': 'Heure',
  'form.date.month.january': 'Janvier',
  'form.date.month.february': 'Février',
  'form.date.month.march': 'Mars',
  'form.date.month.april': 'Avril',
  'form.date.month.may': 'Mai',
  'form.date.month.june': 'Juin',
  'form.date.month.july': 'Juillet',
  'form.date.month.august': 'Août',
  'form.date.month.september': 'Septembre',
  'form.date.month.october': 'Octobre',
  'form.date.month.november': 'Novembre',
  'form.date.month.december': 'Décembre',
  'form.date.weekday.mon': 'L',
  'form.date.weekday.tue': 'M',
  'form.date.weekday.wed': 'M',
  'form.date.weekday.thu': 'J',
  'form.date.weekday.fri': 'V',
  'form.date.weekday.sat': 'S',
  'form.date.weekday.sun': 'D',

  // TierPicker (web/tier-picker.tsx, native/tier-picker.tsx)
  'form.tier.groupLabel': 'Catégorie de billet',
  'form.tier.noDetails':
    'Aucun avantage ni restriction annoncés pour cette catégorie.',

  // SkinPicker (native/skin-picker.tsx)
  'form.skin.lockedSuffix': ' (verrouillé)',

  // ColorPicker (web/color-picker.tsx)
  'form.color.openPicker': 'Ouvrir le sélecteur de couleur',
  'form.color.hexLabel': 'Couleur hexadécimale',
  'form.color.hue': 'Teinte',

  // Cover image (web/cover-image.tsx, native/cover-image.tsx)
  'form.cover.eventAlt': 'Affiche de l’évènement {title}',
  'form.cover.eventFallback': 'Affiche à venir',
  'form.cover.venueAlt': 'Photo de la salle {name}',
  'form.cover.venueFallback': 'Photo à venir',
  'form.cover.venueStripLabel': 'Photos de la salle {name}',

  // Stepper (web/stepper.tsx)
  'form.stepper.navLabel': 'Étapes',

  // Table (web/table.tsx)
  'form.table.empty': 'Aucune donnée.',

  // GlobalSearch (web/global-search.tsx)
  'form.search.placeholder': 'Rechercher joueurs, duels, jeux, salles…',
  'form.search.dialogLabel': 'Recherche',
  'form.search.resultsLabel': 'Résultats',
  'form.search.navigateHint': '↑↓ naviguer',
  'form.search.openHint': '↵ ouvrir',
  'form.search.closeHint': 'Échap pour fermer',
} as const;
