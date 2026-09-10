/**
 * Fragment « ranking » — voir src/i18n/fr.ts.
 * Couvre aussi le vocabulaire des avis de salle (`rating.*`) : il n'existe
 * pas de fragment dédié, et le cahier les traite comme un seul domaine
 * (classement des salles via leurs avis).
 */
export const frRanking = {
  // Classement — canal temps réel
  'ranking.live_status.live': 'En direct',
  'ranking.live_status.connecting': 'Connexion au direct…',
  'ranking.live_status.offline': 'Hors direct',

  // Mouvement d'une ligne de classement (rang)
  'ranking.movement.stable': 'Position stable',
  'ranking.movement.up_one': 'Monté de {n} place',
  'ranking.movement.up_other': 'Monté de {n} places',
  'ranking.movement.down_one': 'Descendu de {n} place',
  'ranking.movement.down_other': 'Descendu de {n} places',

  // Mouvement d'une ligne de classement (division)
  'ranking.division_movement.same': 'Division {division}',
  'ranking.division_movement.up': 'Promu en {division}',
  'ranking.division_movement.down': 'Rétrogradé en {division}',

  // Portées du classement (§4 : saison vs national)
  'ranking.scope_label.season': 'Saison',
  'ranking.scope_label.national': 'National',
  'ranking.scope_hint.season': 'Points du mois en cours. Les divisions se jouent ici.',
  'ranking.scope_hint.national':
    'Ta position parmi tous les joueurs. Indépendante de ta division.',

  // Échéance de classement d'une saison (§6)
  'ranking.duels_until_ranked_one': 'Encore 1 duel pour être classé cette saison',
  'ranking.duels_until_ranked_other': 'Encore {n} duels pour être classé cette saison',
  'ranking.season_remaining.ended': 'Saison terminée',
  'ranking.season_remaining.last_day': 'Dernier jour',
  'ranking.season_remaining.days': 'Il reste {days} jours',

  // Palmarès d'une saison passée (§8)
  'ranking.season_result.in_progress': 'Saison en cours',
  'ranking.season_result.unranked': 'Non classé',
  'ranking.rollover.promoted': 'Promu',
  'ranking.rollover.relegated': 'Relégué',
  'ranking.rollover.stayed': 'Maintenu',

  // Bandeau de saison (état affiché en pilule)
  'ranking.season_state.upcoming': 'À venir',
  'ranking.season_state.live': 'En cours',
  'ranking.season_state.ended': 'Terminée',
  'ranking.season_state.closed': 'Palmarès figé',
  'ranking.progress_aria': 'Avancement de {name}',

  // Avis sur une salle — échelle et mots
  'rating.label.poor': 'À éviter',
  'rating.label.disappointing': 'Décevant',
  'rating.label.fair': 'Correct',
  'rating.label.great': 'Très bien',
  'rating.label.excellent': 'Excellent',
  'rating.count.none': 'Aucun avis',
  'rating.count.value': '{n} avis',

  // Axes détaillés
  'rating.axis.equipment.label': 'Équipement',
  'rating.axis.equipment.hint': 'Manettes, écrans, consoles',
  'rating.axis.connection.label': 'Connexion',
  'rating.axis.connection.hint': 'Débit et stabilité',
  'rating.axis.comfort.label': 'Confort',
  'rating.axis.comfort.hint': 'Place, sièges, propreté',
  'rating.axis.staff.label': 'Accueil',
  'rating.axis.staff.hint': 'Personnel et organisation',

  // Droit de noter (RatingGate)
  'rating.gate.open': 'Donne ton avis sur la salle.',
  'rating.gate.needs_account': 'Connecte-toi pour donner ton avis sur cette salle.',
  'rating.gate.needs_paid_session':
    'Les avis sont réservés aux joueurs qui ont payé une séance ou un abonnement ici. Joue une séance, tu pourras noter juste après.',
  'rating.gate.closed': 'Les avis sont fermés sur cette salle.',

  // Composants d'affichage (StarRating, StarRatingInput, RatingSummary, VenueReview)
  'rating.summary.not_rated': 'Pas encore noté',
  'rating.summary.value_of_max': '{value} sur {max}',
  'rating.summary.empty':
    'Personne n’a encore noté cette salle. Joue une séance ici, tu seras le premier à donner ton avis.',
  'rating.input.choose': 'Choisis une note',
  'rating.review.played_here': 'A joué ici',
} as const;
