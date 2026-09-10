/**
 * Locale du design system.
 *
 * POURQUOI CE FICHIER EXISTE
 * Le design system portait ~170 chaînes françaises EN DUR : « VICT. » sur la
 * carte joueur, « Validé » sur un badge de duel, « En ligne », « Chargement… »,
 * « Duels » sous le bouton central de la barre d'onglets. Les trois apps ont
 * chacune leur i18n et traduisent tout ce qui leur appartient — puis appellent
 * un composant partagé qui répond en français. Un joueur en anglais lisait donc
 * un écran à moitié traduit, et systématiquement sur les mots les plus visibles
 * (statuts, badges, onglets).
 *
 * POURQUOI UN ÉTAT DE MODULE ET PAS UN CONTEXTE REACT
 * La moitié des chaînes vit dans des FONCTIONS PURES — `statusLabel()`,
 * `eventTypeLabel()`, `walletKindLabel()` — appelées hors de tout composant, y
 * compris dans des `useMemo` de tri et des colonnes de tableau. Un
 * `useContext()` y est interdit. C'est exactement le choix déjà fait par
 * `apps/mobile/src/lib/i18n` et `lib/theme.ts` : une variable de module,
 * notifiée aux abonnés via `useSyncExternalStore`.
 *
 * QUI POSE LA LOCALE
 * L'app, une fois, au démarrage : `setDsLocale(locale)` (voir
 * `apps/web/src/lib/i18n/provider.tsx` et `apps/mobile/src/app/_layout.tsx`).
 * Sans appel, on retombe sur `<html lang>` — que le dashboard pose déjà côté
 * serveur depuis le cookie `e237_locale`, donc le rendu serveur est juste dès
 * le premier octet — puis sur le français, langue par défaut du produit
 * (AGENTS.md règle 5). Aucune app n'est CASSÉE si elle n'appelle rien : elle
 * garde le comportement d'avant.
 */
import { useSyncExternalStore } from 'react';

import { en } from './en';
import { fr } from './fr';

export type DsLocale = 'fr' | 'en';
export type DsKey = keyof typeof fr;
export type DsVars = Record<string, string | number>;

const DICTS: Record<DsLocale, Record<DsKey, string>> = { fr, en };

/** `null` = aucune app n'a parlé : on déduit (voir `dsLocale`). */
let explicit: DsLocale | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Repli web : la langue posée sur `<html lang>`.
 *
 * Ce n'est pas la langue du NAVIGATEUR mais celle CHOISIE dans l'app — le
 * dashboard la lit dans le cookie `e237_locale` et la pose sur `<html>` côté
 * serveur (`apps/web/src/app/layout.tsx`). C'est donc une source de vérité, et
 * elle a l'avantage d'être juste pendant le rendu serveur, où aucune variable
 * de module ne peut l'être (un même processus sert des requêtes de langues
 * différentes).
 */
function fromDocument(): DsLocale | null {
  // Accès par `globalThis` et non par `document` : ce fichier est compilé aussi
  // par `tsconfig.native.json`, qui ne charge pas la lib `dom` — et à raison,
  // il n'y a pas de DOM sur un téléphone.
  const doc = (globalThis as { document?: { documentElement?: { lang?: string } } })
    .document;
  const lang = doc?.documentElement?.lang?.toLowerCase();
  if (!lang) return null;
  return lang.startsWith('en') ? 'en' : lang.startsWith('fr') ? 'fr' : null;
}

/** Locale effective, utilisable partout — composant ou fonction pure. */
export function dsLocale(): DsLocale {
  return explicit ?? fromDocument() ?? 'fr';
}

/** Déclare la locale de l'app. Idempotent : ne notifie que si elle change. */
export function setDsLocale(next: DsLocale): void {
  if (explicit === next) return;
  explicit = next;
  notify();
}

/** Remplace `{name}` par `vars.name` ; une variable absente reste telle quelle. */
function interpolate(template: string, vars?: DsVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

/** Fonction pure — testable sans React. */
export function dsTranslate(locale: DsLocale, key: DsKey, vars?: DsVars): string {
  const template = DICTS[locale][key] ?? fr[key];
  return interpolate(template, vars);
}

/**
 * Traduit avec la locale courante.
 *
 * Appelable hors composant. Dans un composant, préférer `useDsT()` : `dsT` ne
 * provoque aucun re-rendu au changement de langue.
 */
export function dsT(key: DsKey, vars?: DsVars): string {
  return dsTranslate(dsLocale(), key, vars);
}

/**
 * Version abonnée de `dsT`, pour les composants : le rendu suit le changement
 * de langue sans recharger la page.
 */
export function useDsT(): (key: DsKey, vars?: DsVars) => string {
  const locale = useDsLocale();
  return (key, vars) => dsTranslate(locale, key, vars);
}

/** Locale courante, abonnée. */
export function useDsLocale(): DsLocale {
  return useSyncExternalStore(subscribe, dsLocale, dsLocale);
}

export { fr as dsFr, en as dsEn };
