/**
 * Horodatage relatif — « il y a 3 h », « hier », « il y a 4 j ».
 *
 * Le fil d'actualité affichait des dates absolues (« 15 août, 09:40 »). Dans
 * un fil, une date absolue oblige à un calcul mental à chaque ligne pour
 * répondre à la seule question qui compte : est-ce récent ? Tous les fils de
 * référence — X, Digg, Whop, Lex, Weverse — affichent du relatif, et
 * basculent sur l'absolu au-delà de quelques jours, quand « il y a 47 j »
 * cesse d'être plus parlant qu'une date.
 *
 * Le seuil de bascule est à une semaine.
 */

/** Au-delà de ce délai, une date absolue redevient plus lisible. */
const ABSOLUTE_AFTER_MS = 7 * 24 * 3600_000;

/**
 * @param value    date ISO (ou `null`)
 * @param nowMs    instant de référence — **passé explicitement** pour que la
 *                 fonction reste pure : appeler `Date.now()` ici rendrait tout
 *                 composant qui l'utilise non idempotent au rendu.
 */
export function formatRelativeTime(
  value: string | null | undefined,
  nowMs: number,
): string {
  if (!value) return '—';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '—';

  const diff = nowMs - then;

  // Horodatage futur (décalage d'horloge, événement à venir) : on ne dit pas
  // « il y a -3 min », on retombe sur « à l'instant ».
  if (diff < 60_000) return "à l'instant";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(diff / 3600_000);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(diff / 86_400_000);
  if (days === 1) return 'hier';
  if (diff < ABSOLUTE_AFTER_MS) return `il y a ${days} j`;

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year:
        new Date(then).getFullYear() === new Date(nowMs).getFullYear()
          ? undefined
          : 'numeric',
    }).format(new Date(then));
  } catch {
    return value.slice(0, 10);
  }
}
