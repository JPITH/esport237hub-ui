/**
 * Carte globale du joueur.
 *
 * Un joueur = une identité globale + N cartes de jeu. La carte globale n'est
 * stockée nulle part : elle se dérive de toutes ses cartes de jeu. Ses six
 * emplacements de statistiques affichent ses disciplines — six au maximum,
 * les meilleures par points, même s'il en pratique davantage.
 */

export const GLOBAL_CARD_MAX_GAMES = 6;

export interface GameCardLike {
  id: string;
  points: number;
  rating: number;
  wins: number;
  losses: number;
  game: { slug: string; name: string };
}

export interface GlobalCardGame {
  slug: string;
  name: string;
  points: number;
  rating: number;
}

export interface GlobalCardData {
  /** Meilleure note parmi les disciplines — identique au calcul du web. */
  overall: number;
  points: number;
  wins: number;
  losses: number;
  games: GlobalCardGame[];
  /** Disciplines au-delà des six affichées. */
  extraGames: number;
}

export function buildGlobalCard(cards: GameCardLike[]): GlobalCardData {
  if (cards.length === 0) {
    return { overall: 0, points: 0, wins: 0, losses: 0, games: [], extraGames: 0 };
  }

  const sorted = [...cards].sort(
    (a, b) => b.points - a.points || a.game.name.localeCompare(b.game.name),
  );

  return {
    overall: Math.max(...cards.map((c) => c.rating)),
    points: cards.reduce((sum, c) => sum + c.points, 0),
    wins: cards.reduce((sum, c) => sum + c.wins, 0),
    losses: cards.reduce((sum, c) => sum + c.losses, 0),
    games: sorted.slice(0, GLOBAL_CARD_MAX_GAMES).map((c) => ({
      slug: c.game.slug,
      name: c.game.name,
      points: c.points,
      rating: c.rating,
    })),
    extraGames: Math.max(0, cards.length - GLOBAL_CARD_MAX_GAMES),
  };
}
