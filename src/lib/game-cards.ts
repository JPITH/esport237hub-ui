/**
 * Cartes de jeu — règles pures partagées par le web, le mobile et les tests.
 *
 * Décision produit du 07/10/2026 : **plus de carte globale**. Un joueur a une
 * carte PAR DISCIPLINE, et c'est tout. Là où un écran n'a la place que pour
 * une carte (aperçu d'un skin, partage, champion d'un classement), il montre
 * celle du **jeu principal** — `mainGameCard` en décide, au même endroit pour
 * toutes les plateformes.
 */

/** Le minimum qu'une carte doit porter pour être départagée. */
export interface MainCardLike {
  points: number;
  wins?: number | null;
  losses?: number | null;
  rating?: number | null;
  game?: { slug: string; name: string } | null;
}

function played(card: MainCardLike): number {
  return (card.wins ?? 0) + (card.losses ?? 0);
}

/**
 * Le jeu principal d'un joueur : la discipline où il a le plus de points de
 * carrière, puis le plus de duels joués, puis la meilleure note ; à égalité
 * parfaite (nouveau joueur, tout à zéro), l'ordre alphabétique du jeu — jamais
 * l'ordre de la réponse de l'API, qui n'en garantit aucun.
 *
 * `null` sans carte : l'écran affiche son état vide, il n'invente pas de carte.
 */
export function mainGameCard<T extends MainCardLike>(
  cards: readonly T[] | null | undefined,
): T | null {
  if (!cards?.length) return null;
  return [...cards].sort(
    (a, b) =>
      b.points - a.points ||
      played(b) - played(a) ||
      (b.rating ?? 0) - (a.rating ?? 0) ||
      (a.game?.name ?? '').localeCompare(b.game?.name ?? ''),
  )[0];
}

/**
 * Cartes rangées pour un sélecteur de jeu : le jeu principal d'abord, puis le
 * même ordre que `mainGameCard`. Le premier onglet est donc toujours la carte
 * que montrerait un écran à une seule carte.
 */
export function orderedGameCards<T extends MainCardLike>(
  cards: readonly T[] | null | undefined,
): T[] {
  const list = [...(cards ?? [])];
  const out: T[] = [];
  while (list.length) {
    const next = mainGameCard(list)!;
    out.push(next);
    list.splice(list.indexOf(next), 1);
  }
  return out;
}

/** Bilan affiché au verso d'une carte. */
export interface CardRecord {
  played: number;
  wins: number;
  losses: number;
  /** Pourcentage arrondi, `null` sans duel joué (« — » plutôt que « 0 % »). */
  winRate: number | null;
}

/**
 * Bilan d'une carte à partir des seules données déjà chargées : aucune route
 * n'est appelée pour le verso. `losses` absent = bilan inconnu, on ne compte
 * que les victoires (un joueur n'a jamais 100 % parce qu'on ignore ses
 * défaites) : `winRate` reste alors `null`.
 */
export function cardRecord(wins: number, losses?: number | null): CardRecord {
  const w = Math.max(0, Math.floor(wins || 0));
  if (losses == null) {
    return { played: w, wins: w, losses: 0, winRate: null };
  }
  const l = Math.max(0, Math.floor(losses));
  const total = w + l;
  return {
    played: total,
    wins: w,
    losses: l,
    winRate: total > 0 ? Math.round((w / total) * 100) : null,
  };
}

/**
 * Position d'une colonne de compteur « odomètre », dans [0, 10].
 *
 * `place` = rang décimal de la colonne (0 = unités, 1 = dizaines…). La colonne
 * empile les chiffres 0→9 puis un 0 de bouclage : la position 10 se lit donc
 * comme un 0, et la translation reste continue quand les unités passent de 9 à
 * 0. Les rangs supérieurs ne tournent que pendant la DERNIÈRE unité de leur
 * rang inférieur (68,5 → dizaines toujours sur 6 ; 69,6 → 6,6), comme un vrai
 * compteur mécanique.
 *
 * Fonction pure ET worklet : elle tourne sur le fil UI (Reanimated) à chaque
 * image, sans aller-retour vers le JS ni `setState`.
 */
export function odometerOffset(value: number, place: number): number {
  'worklet';
  const v = Math.max(0, value);
  if (place <= 0) return v % 10;
  const unit = Math.pow(10, place);
  const base = Math.floor(v / unit) % 10;
  const lower = v % unit;
  const carry = Math.max(0, lower - (unit - 1));
  return base + carry;
}

/** Nombre de chiffres à prévoir pour un compteur qui va de `from` à `to`. */
export function odometerDigits(from: number, to: number): number {
  const max = Math.max(1, Math.floor(Math.abs(from)), Math.floor(Math.abs(to)));
  return String(max).length;
}
