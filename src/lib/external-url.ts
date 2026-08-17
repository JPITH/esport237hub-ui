/**
 * Filtrage des URL rédigées par un tiers avant de les poser dans un `href`.
 *
 * Le produit affiche deux liens qu'il n'a pas écrits :
 *
 *   • `events.url` — « Plus d'informations » sur la page d'un événement, saisi
 *     par l'ORGANISATEUR. C'est le cas sensible : n'importe quel compte
 *     organisateur peut y mettre ce qu'il veut, et le lien est cliqué par tous
 *     les participants de l'événement.
 *   • `house_ads.target_url` — la bannière de régie, saisie par un admin.
 *
 * Le risque n'est pas théorique. `href="javascript:…"` exécute le script dans
 * la session de la personne qui clique — donc avec son jeton, sur son
 * portefeuille. `rel="noopener noreferrer"` et `target="_blank"` n'y changent
 * rien : ils protègent la fenêtre ouverte, pas la page qui ouvre. React
 * avertit en console sur ces URL mais ne garantit pas de les bloquer, et de
 * toute façon on ne veut pas dépendre de ça.
 *
 * Cette fonction est le SECOND rempart, pas le premier. La validation à
 * l'écriture vit dans les DTO de l'API (`@IsUrl({ protocols, require_protocol })`).
 * Les deux sont nécessaires : la base contient déjà ce qui a été écrit avant que
 * le validateur existe, et l'API n'est pas la seule à écrire (jeux de
 * démonstration, scripts en rôle service, SQL d'administration).
 */

/**
 * @param raw valeur telle qu'elle sort de l'API — souvent `null`.
 * @returns l'URL si elle est sûre à afficher, sinon `undefined` (l'appelant
 *   n'affiche alors simplement pas le lien).
 *
 * Exige une URL ABSOLUE en `http:` ou `https:`. Ce choix n'est pas une
 * restriction gratuite, c'est ce qui rend la fonction sûre : la première
 * version acceptait aussi les chemins relatifs, ce qui obligeait à résoudre
 * l'entrée contre un hôte factice — et deux de mes propres tests ont montré
 * que ça ouvrait la porte à des entrées absurdes (`://`, `jav ascript:alert(1)`)
 * renvoyées telles quelles dans un `href`. Or les deux appelants pointent par
 * définition HORS du site : un chemin relatif n'y a aucun sens. Le parseur
 * natif, sans base, tranche donc seul et sans ambiguïté.
 *
 * S'appuyer sur `new URL` plutôt que sur une expression régulière est
 * volontaire : il normalise avant de lire le schéma, donc il traite les formes
 * obfusquées (`java\tscript:`, casses mélangées, blancs de tête) exactement
 * comme le navigateur les traitera.
 */
export function safeExternalUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    // Pas une URL absolue : chemin relatif, texte libre, chaîne tronquée.
    return undefined;
  }

  // Liste blanche, jamais liste noire : un schéma inconnu doit être refusé par
  // défaut, sinon chaque nouveau schéma exotique est une régression silencieuse.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;

  // Un hôte est indispensable : `http://` seul parse mais ne mène nulle part.
  if (!parsed.hostname) return undefined;

  // On renvoie la forme NORMALISÉE par le parseur, pas l'entrée brute : c'est
  // exactement ce que le navigateur suivra, sans blanc de tête ni caractère
  // invisible resté au milieu.
  return parsed.href;
}
