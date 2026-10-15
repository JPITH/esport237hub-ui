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
 * 15/10/2026 (audit T10) : la règle vit dans le module de temps commun
 * (`formatAge`, `@esport237hub/types`, testé) ; ce module ne fait plus que lui
 * passer la locale du design system. Il parlait français en dur au milieu
 * d'un écran anglais, et rendait « — » pour une date absente (chaîne vide
 * désormais).
 */
import { formatAge, localeTag } from '@esport237hub/types';

import { dsLocale } from '../i18n/store';

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
  return formatAge(value, nowMs, localeTag(dsLocale()), 'long');
}
