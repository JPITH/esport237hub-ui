/**
 * Vocabulaire produit partagé : évènements, compétitions, billets.
 *
 * Ces tables étaient écrites deux fois — `apps/web/src/lib/events.ts` vs
 * `apps/mobile/src/lib/format.ts`, `events/competitions-list.tsx` vs
 * `apps/mobile/src/app/(tabs)/competitions.tsx` — et divergeaient déjà
 * (« Démo/Showcase » d'un côté, « Showcase » de l'autre). Une seule source
 * ici ; les fonctions sont tolérantes aux valeurs inconnues pour ne jamais
 * afficher un identifiant technique brut à un joueur.
 */
import type { Tone } from './tone';

/* ------------------------------------------------------------------ */
/* Visuels des disciplines                                             */
/* ------------------------------------------------------------------ */

/**
 * Identifiant de discipline → nom court du fichier livré dans `public/media`.
 *
 * Les visuels ont été nommés court (`game-clash.png`) alors que les
 * identifiants produits sont longs (`clash-royale`). Sans cette table, chaque
 * écran devine — et se trompe : le rail affichait des images cassées pour
 * trois disciplines sur cinq.
 */
const GAME_ASSET: Record<string, string> = {
  fc27: 'fc27',
  'clash-royale': 'clash',
  codm: 'cod',
  'pubg-mobile': 'pubg',
  valorant: 'valorant',
};

/**
 * Vignette d'une discipline, ou `undefined` si aucun visuel n'est livré.
 *
 * Renvoyer `undefined` plutôt qu'une URL improbable est délibéré : les
 * composants savent afficher un repli propre (initiales), mais seulement si
 * on ne leur ment pas sur l'existence de l'image.
 */
export function gameIconUrl(slug: string | null | undefined): string | undefined {
  const key = slug ? GAME_ASSET[slug] : undefined;
  return key ? `/media/game-${key}.png` : undefined;
}

/** Bandeau large d'une discipline (accueil, en-têtes). */
export function gameHeroUrl(slug: string | null | undefined): string | undefined {
  const key = slug ? GAME_ASSET[slug] : undefined;
  return key ? `/media/hero-${key}.png` : undefined;
}

/* ------------------------------------------------------------------ */
/* Journal d'audit (back-office)                                       */
/* ------------------------------------------------------------------ */

/**
 * Actions journalisées → libellé français.
 *
 * Le journal d'audit affichait ses identifiants bruts (`duel.validate`,
 * `points.recompute`) en police à chasse fixe. C'est la règle transverse la
 * plus simple du produit et la plus souvent oubliée : une valeur venue de la
 * base n'atteint jamais l'écran telle quelle. Un modérateur qui relit une
 * décision de la veille ne devrait pas avoir à traduire mentalement un slug.
 */
export const AUDIT_ACTION_LABEL: Record<string, string> = {
  'duel.validate': 'Duel validé',
  'duel.cancel': 'Duel annulé',
  'duel.dispute': 'Litige ouvert',
  'duel.resolve': 'Litige tranché',
  'venue.verify': 'Salle vérifiée',
  'venue.reject': 'Salle refusée',
  'venue.suspend': 'Salle suspendue',
  'points.recompute': 'Points recalculés',
  'division.update': 'Division modifiée',
  'game.update': 'Discipline modifiée',
  'user.suspend': 'Compte suspendu',
  'payout.approve': 'Reversement approuvé',
};

/** Type d'objet concerné par une action d'audit. */
export const AUDIT_OBJECT_LABEL: Record<string, string> = {
  duel: 'Duel',
  venue: 'Salle',
  season: 'Saison',
  division: 'Division',
  game: 'Discipline',
  user: 'Compte',
  payout: 'Reversement',
  event: 'Événement',
};

/** Auteur d'une action journalisée. */
export const AUDIT_ACTOR_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  system: 'Automatique',
  venue: 'Salle',
  player: 'Joueur',
};

/**
 * Libellé d'une action d'audit. Tolérant : une action ajoutée côté back-end
 * sans passer par cette table reste lisible plutôt que d'afficher un slug —
 * `duel.validate` devient « Duel · validate », pas `duel.validate`.
 */
export function auditActionLabel(action: string | null | undefined): string {
  if (!action) return '—';
  const known = AUDIT_ACTION_LABEL[action];
  if (known) return known;
  const [object, verb] = action.split('.');
  if (verb && object) {
    return `${AUDIT_OBJECT_LABEL[object] ?? object} · ${verb}`;
  }
  return action;
}

export function auditObjectLabel(kind: string | null | undefined): string {
  if (!kind) return '—';
  return AUDIT_OBJECT_LABEL[kind] ?? kind;
}

export function auditActorLabel(kind: string | null | undefined): string {
  if (!kind) return '—';
  return AUDIT_ACTOR_LABEL[kind] ?? kind;
}

/* ------------------------------------------------------------------ */
/* Évènements                                                          */
/* ------------------------------------------------------------------ */

export const EVENT_TYPE_LABEL: Record<string, string> = {
  tournament: 'Tournoi',
  meetup: 'Rencontre',
  watch_party: 'Projection',
  showcase: 'Démo/Showcase',
  other: 'Autre',
};

export const EVENT_TYPE_TONE: Record<string, Tone> = {
  tournament: 'gold',
  meetup: 'cyan',
  watch_party: 'accent',
  showcase: 'warning',
  other: 'neutral',
};

/** Type d'évènement en français, tolérant aux valeurs absentes/inconnues. */
export function eventTypeLabel(type: string | null | undefined): string {
  if (!type) return '—';
  return EVENT_TYPE_LABEL[type] ?? type;
}

export function eventTypeTone(type: string | null | undefined): Tone {
  if (!type) return 'neutral';
  return EVENT_TYPE_TONE[type] ?? 'neutral';
}

export const EVENT_STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  cancelled: 'Annulé',
  finished: 'Terminé',
};

/* ------------------------------------------------------------------ */
/* Compétitions                                                        */
/* ------------------------------------------------------------------ */

export const COMPETITION_FORMAT_LABEL: Record<string, string> = {
  single_elimination: 'Élimination directe',
  double_elimination: 'Double élimination',
  round_robin: 'Poules (round robin)',
  groups_playoffs: 'Poules + phase finale',
  swiss: 'Système suisse',
};

export function competitionFormatLabel(
  format: string | null | undefined,
): string {
  if (!format) return '—';
  return COMPETITION_FORMAT_LABEL[format] ?? format;
}

export const COMPETITION_STATUS_TONE: Record<string, Tone> = {
  ongoing: 'accent',
  upcoming: 'cyan',
  finished: 'neutral',
};

export const COMPETITION_STATUS_LABEL: Record<string, string> = {
  ongoing: 'En cours',
  upcoming: 'À venir',
  finished: 'Terminée',
};

export function competitionStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) return '—';
  return COMPETITION_STATUS_LABEL[status] ?? status;
}

export function competitionStatusTone(status: string | null | undefined): Tone {
  if (!status) return 'neutral';
  return COMPETITION_STATUS_TONE[status] ?? 'neutral';
}

/* ------------------------------------------------------------------ */
/* Billets d'évènement                                                 */
/* ------------------------------------------------------------------ */

export const TICKET_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  paid: { label: 'Payé', tone: 'accent' },
  reserved: { label: 'À régler sur place', tone: 'warning' },
  cancelled: { label: 'Annulé', tone: 'danger' },
  refunded: { label: 'Remboursé', tone: 'neutral' },
};

export function ticketStatusMeta(status: string): { label: string; tone: Tone } {
  return TICKET_STATUS_META[status] ?? { label: status, tone: 'neutral' };
}

/* ------------------------------------------------------------------ */
/* Abonnements de salle                                                */
/* ------------------------------------------------------------------ */

export const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  pending_payment: 'En attente d’encaissement',
  active: 'Active',
  exhausted: 'Épuisé',
  expired: 'Expiré',
  cancelled: 'Annulé',
};

export function subscriptionStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) return '—';
  return SUBSCRIPTION_STATUS_LABEL[status] ?? status;
}

/* ------------------------------------------------------------------ */
/* Plateformes de jeu                                                  */
/* ------------------------------------------------------------------ */

/**
 * Plateformes déclarées par une discipline (`games.platforms`).
 * La table était recopiée mot pour mot dans les deux écrans « Duels »
 * (web et natif) : une seule source ici, comme le reste du vocabulaire.
 */
export const PLATFORM_LABEL: Record<string, string> = {
  ps5: 'PS5',
  ps4: 'PS4',
  xbox: 'Xbox',
  pc: 'PC',
  mobile: 'Mobile',
};

/** Plateforme en clair ; on retombe sur l'identifiant si elle est inconnue. */
export function platformLabel(platform: string | null | undefined): string {
  if (!platform) return '—';
  return PLATFORM_LABEL[platform] ?? platform;
}
