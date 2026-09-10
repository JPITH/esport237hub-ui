/** Fragment « catalog » — voir src/i18n/fr.ts. */
export const frCatalog = {
  // Journal d'audit (back-office) — actions journalisées
  'catalog.audit.action.duelValidate': 'Duel validé',
  'catalog.audit.action.duelCancel': 'Duel annulé',
  'catalog.audit.action.duelDispute': 'Litige ouvert',
  'catalog.audit.action.duelResolve': 'Litige tranché',
  'catalog.audit.action.venueVerify': 'Salle vérifiée',
  'catalog.audit.action.venueReject': 'Salle refusée',
  'catalog.audit.action.venueSuspend': 'Salle suspendue',
  'catalog.audit.action.pointsRecompute': 'Points recalculés',
  'catalog.audit.action.divisionUpdate': 'Division modifiée',
  'catalog.audit.action.gameUpdate': 'Discipline modifiée',
  'catalog.audit.action.userSuspend': 'Compte suspendu',
  'catalog.audit.action.payoutApprove': 'Reversement approuvé',

  // Journal d'audit — type d'objet concerné
  'catalog.audit.object.duel': 'Duel',
  'catalog.audit.object.venue': 'Salle',
  'catalog.audit.object.season': 'Saison',
  'catalog.audit.object.division': 'Division',
  'catalog.audit.object.game': 'Discipline',
  'catalog.audit.object.user': 'Compte',
  'catalog.audit.object.payout': 'Reversement',
  'catalog.audit.object.event': 'Événement',

  // Journal d'audit — auteur de l'action
  'catalog.audit.actor.admin': 'Administrateur',
  'catalog.audit.actor.system': 'Automatique',
  'catalog.audit.actor.venue': 'Salle',
  'catalog.audit.actor.player': 'Joueur',

  // Type d'évènement
  'catalog.eventType.tournament': 'Tournoi',
  'catalog.eventType.meetup': 'Rencontre',
  'catalog.eventType.watchParty': 'Projection',
  'catalog.eventType.showcase': 'Démo/Showcase',
  'catalog.eventType.other': 'Autre',

  // Statut d'évènement
  'catalog.eventStatus.draft': 'Brouillon',
  'catalog.eventStatus.published': 'Publié',
  'catalog.eventStatus.cancelled': 'Annulé',
  'catalog.eventStatus.finished': 'Terminé',

  // Format de compétition
  'catalog.competitionFormat.singleElimination': 'Élimination directe',
  'catalog.competitionFormat.doubleElimination': 'Double élimination',
  'catalog.competitionFormat.roundRobin': 'Poules (round robin)',
  'catalog.competitionFormat.groupsPlayoffs': 'Poules + phase finale',
  'catalog.competitionFormat.swiss': 'Système suisse',

  // Statut de compétition
  'catalog.competitionStatus.ongoing': 'En cours',
  'catalog.competitionStatus.upcoming': 'À venir',
  'catalog.competitionStatus.finished': 'Terminée',

  // Statut de billet d'évènement
  'catalog.ticketStatus.paid': 'Payé',
  'catalog.ticketStatus.reserved': 'À régler sur place',
  'catalog.ticketStatus.cancelled': 'Annulé',
  'catalog.ticketStatus.refunded': 'Remboursé',

  // Statut d'abonnement de salle
  'catalog.subscriptionStatus.pendingPayment': 'En attente d’encaissement',
  'catalog.subscriptionStatus.active': 'Active',
  'catalog.subscriptionStatus.exhausted': 'Épuisé',
  'catalog.subscriptionStatus.expired': 'Expiré',
  'catalog.subscriptionStatus.cancelled': 'Annulé',

  // Plateforme de jeu
  'catalog.platform.ps5': 'PS5',
  'catalog.platform.ps4': 'PS4',
  'catalog.platform.xbox': 'Xbox',
  'catalog.platform.pc': 'PC',
  'catalog.platform.mobile': 'Mobile',
} as const;
