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
