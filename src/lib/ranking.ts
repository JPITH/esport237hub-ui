/**
 * Classement — libellés de mouvement et horloge du direct.
 *
 * Ces trois calculs étaient dupliqués entre `apps/web/.../classement/page.tsx`
 * et `apps/mobile/.../(tabs)/classement.tsx`, `formatClock` avec des sorties
 * DIVERGENTES (secondes côté web, pas côté natif) alors que c'est le même
 * bandeau « Mis à jour à … ». On garde les secondes : le classement en direct
 * bouge à la seconde, l'heure doit le montrer.
 */

/** Sens de mouvement d'une ligne (rang) ou d'un grade (division). */
export type RankMovement = 'up' | 'down' | 'same';

/** État du canal temps réel du classement. */
export type LiveStatus = 'live' | 'connecting' | 'offline';

export const LIVE_STATUS_LABEL: Record<LiveStatus, string> = {
  live: 'En direct',
  connecting: 'Connexion au direct…',
  offline: 'Hors direct',
};

/**
 * Nombre de places gagnées ou perdues, ou `undefined` si la ligne n'a pas
 * bougé (ou n'a pas d'historique).
 */
export function rankMovementPlaces(
  movement: RankMovement,
  rank: number,
  previousRank: number | null | undefined,
): number | undefined {
  if (movement === 'same' || previousRank === null || previousRank === undefined) {
    return undefined;
  }
  return Math.abs(previousRank - rank);
}

/** « Monté de 3 places » / « Descendu de 1 place » / « Position stable ». */
export function rankMovementLabel(
  movement: RankMovement,
  places: number | undefined,
): string {
  if (places === undefined) return 'Position stable';
  const plural = places > 1 ? 's' : '';
  return movement === 'up'
    ? `Monté de ${places} place${plural}`
    : `Descendu de ${places} place${plural}`;
}

/** « Promu en Elite » / « Rétrogradé en Challenger » / division inchangée. */
export function divisionMovementLabel(
  movement: RankMovement,
  divisionName: string,
): string {
  if (movement === 'same') return `Division ${divisionName}`;
  return movement === 'up'
    ? `Promu en ${divisionName}`
    : `Rétrogradé en ${divisionName}`;
}

/** Heure locale « 14:32:05 » — l'horodatage n'existe qu'après montage. */
export function formatClock(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    const d = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}

/* ------------------------------------------------------------------ */
/* Portées du classement — saisonnier / général                        */
/* ------------------------------------------------------------------ */

/**
 * Les deux classements du produit, et il ne faut surtout pas les confondre.
 *
 * Document « G-Hub — Ranking, Divisions, Duels et Saisons » §4 :
 *  * `season` — la Division répond à « quel est mon niveau compétitif pendant
 *    cette saison ? ». Remis à zéro chaque mois, c'est LUI qui porte les
 *    divisions : un grade n'a de sens que sur une période fermée.
 *  * `national` — le Ranking national répond à « quelle est ma position
 *    globale parmi tous les joueurs ? ». Jamais remis à zéro, et INDÉPENDANT
 *    de la division : §2 le dit noir sur blanc, « un joueur peut être en
 *    Division 3 et avoir un meilleur Ranking national qu'un joueur d'une
 *    division supérieure ». Ne jamais y afficher de pilule de division.
 */
export type RankingScope = 'season' | 'national';

export const RANKING_SCOPES: readonly RankingScope[] = ['season', 'national'];

/** Onglet. Court : il vit dans un sélecteur de deux boutons. */
export const RANKING_SCOPE_LABEL: Record<RankingScope, string> = {
  season: 'Saison',
  national: 'National',
};

/** Ce que l'onglet promet — affiché sous le sélecteur, une ligne. */
export const RANKING_SCOPE_HINT: Record<RankingScope, string> = {
  season: 'Points du mois en cours. Les divisions se jouent ici.',
  national: 'Ta position parmi tous les joueurs. Indépendante de ta division.',
};

/* ------------------------------------------------------------------ */
/* Le plancher et le plafond de duels d'une saison (§6)                */
/* ------------------------------------------------------------------ */

/** En dessous, le joueur n'entre pas au classement final de la saison. */
export const MIN_DUELS_FOR_RANKING = 5;

/** Au-delà, les duels se jouent encore mais ne rapportent plus de points. */
export const MAX_COUNTED_DUELS = 20;

/** Le joueur sera-t-il classé si la saison se termine maintenant ? */
export function isRankedForSeason(duelsPlayed: number): boolean {
  return duelsPlayed >= MIN_DUELS_FOR_RANKING;
}

/**
 * Ce qu'il reste à faire pour être classé — la phrase que l'écran de saison
 * doit montrer. `null` quand c'est acquis : on ne félicite pas à chaque
 * affichage, et on n'écrit jamais « 0 duel restant ».
 *
 * Un joueur qui découvre en fin de mois qu'il n'était pas classé aura joué
 * pour rien ; c'est la seule information de cet écran qui a une échéance.
 */
export function duelsUntilRankedLabel(duelsPlayed: number): string | null {
  const left = MIN_DUELS_FOR_RANKING - duelsPlayed;
  if (left <= 0) return null;
  return left === 1
    ? 'Encore 1 duel pour être classé cette saison'
    : `Encore ${left} duels pour être classé cette saison`;
}

/**
 * Les duels de la saison qui rapportent encore. Au-delà du plafond, le joueur
 * continue de jouer — il ne marque plus.
 */
export function countedDuels(duelsPlayed: number): number {
  return Math.min(Math.max(0, duelsPlayed), MAX_COUNTED_DUELS);
}

/** Une division telle qu'elle s'affiche : le palier compte depuis le HAUT. */
export interface DivisionView {
  /** Grade en base — le plus GRAND est le plus haut. Ne pas afficher. */
  rank: number;
  /**
   * Palier affiché : 1 = la division la plus haute. C'est l'API qui le
   * calcule (elle seule connaît la liste complète des divisions d'un jeu) —
   * voir `divisionTier()` côté NestJS. En son absence on retombe sur `rank`,
   * mais l'affichage sera alors à l'envers : c'est un défaut visible, pas une
   * corruption silencieuse.
   */
  tier?: number;
  name: string;
  color?: string | null;
}

/** Le numéro à écrire dans la pilule « DIV n ». */
export function divisionDisplayRank(division: DivisionView): number {
  return division.tier ?? division.rank;
}

/**
 * Avancement d'une saison, de 0 à 1. Sert à la barre « il reste X jours » :
 * une saison sans date de fin renvoie `null`, et l'interface n'affiche alors
 * pas de barre plutôt qu'une barre vide qui laisserait croire à une fin
 * imminente.
 */
export function seasonProgress(
  startsAt: string | number | Date,
  endsAt: string | number | Date | null | undefined,
  now: number = Date.now(),
): number | null {
  if (endsAt === null || endsAt === undefined) return null;
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const ratio = (now - start) / (end - start);
  if (ratio <= 0) return 0;
  if (ratio >= 1) return 1;
  return Math.round(ratio * 100) / 100;
}

/**
 * « Il reste 12 jours » / « Dernier jour » / « Saison terminée ».
 * `null` quand la saison n'a pas de fin — on n'invente pas d'échéance.
 */
export function seasonRemainingLabel(
  endsAt: string | number | Date | null | undefined,
  now: number = Date.now(),
): string | null {
  if (endsAt === null || endsAt === undefined) return null;
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(end)) return null;
  const msLeft = end - now;
  if (msLeft <= 0) return 'Saison terminée';
  const days = Math.ceil(msLeft / 86_400_000);
  if (days <= 1) return 'Dernier jour';
  return `Il reste ${days} jours`;
}
