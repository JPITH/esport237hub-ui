/**
 * Hooks de locale — SÉPARÉS du store.
 *
 * `useSyncExternalStore` n'existe pas dans un React Server Component, et Next
 * refuse de compiler tout module qui l'importe dès qu'il apparaît dans le
 * graphe serveur. Or `./store` est justement fait pour être appelé côté
 * serveur : `duels/[id]/layout.tsx` traduit un statut de duel pour les balises
 * de partage, `opengraph-image.tsx` pour l'image. Les deux moitiés ne peuvent
 * donc pas vivre dans le même fichier — c'est la SÉPARATION qui règle le
 * problème, `./lib` n'exportant plus que le store.
 *
 * Pas de directive `'use client'` ici, volontairement : elle ferait de ce
 * module une frontière client, et `src/web/index.tsx` — que les apps
 * ré-exportent en bloc depuis des fichiers sans directive — deviendrait un
 * barillet mixte. Ce module suit la même règle que le reste de `src/web` et
 * `src/native` : il n'est rendu que dans un arbre client, comme tous les
 * composants du design system qui appellent déjà `useState`.
 */
import { useSyncExternalStore } from 'react';

import {
  dsLocale,
  dsTranslate,
  subscribeDsLocale,
  type DsKey,
  type DsLocale,
  type DsVars,
} from './store';

/** Locale courante, abonnée. */
export function useDsLocale(): DsLocale {
  return useSyncExternalStore(subscribeDsLocale, dsLocale, dsLocale);
}

/**
 * Version abonnée de `dsT`, pour les composants : le rendu suit le changement
 * de langue sans recharger la page.
 */
export function useDsT(): (key: DsKey, vars?: DsVars) => string {
  const locale = useDsLocale();
  return (key, vars) => dsTranslate(locale, key, vars);
}
