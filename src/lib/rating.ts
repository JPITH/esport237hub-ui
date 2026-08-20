/**
 * Avis sur une salle — vocabulaire et calculs d'AFFICHAGE.
 *
 * Demande du porteur (20/08/2026) : « après une session dans une salle,
 * l'utilisateur peut noter la salle — autorisé si on a pris l'abonnement ou
 * payé une session — pour avoir un classement des salles ».
 *
 * Ce module ne décide de rien : ni du droit de noter (règle métier, elle vit
 * dans `apps/api/src/modules/venues/ratings.logic.ts` et personne d'autre ne
 * doit la rejouer), ni du score de classement d'une salle (idem). Il tient le
 * VOCABULAIRE — les libellés que le web et le natif doivent écrire à
 * l'identique — et les conversions d'affichage : combien d'étoile pleine,
 * quel pourcentage de barre.
 *
 * Le porte-à-faux à éviter est connu : une note ronde côté web (« 4 ») et une
 * note à la décimale côté natif (« 4,3 ») sur la même salle, et le joueur croit
 * à deux salles différentes.
 */

/** Bornes de la note. La base les garde aussi (`check (rating between 1 and 5)`). */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Une note entière, telle qu'un joueur la pose. */
export type RatingScore = 1 | 2 | 3 | 4 | 5;

/** Les cinq notes, de la meilleure à la pire — l'ordre d'une distribution. */
export const RATING_SCORES: readonly RatingScore[] = [5, 4, 3, 2, 1];

/**
 * Ce que chaque note VEUT DIRE. Sans ces mots, deux joueurs ne mettent pas
 * 3 étoiles pour la même chose : l'échelle est affichée, pas devinée.
 */
export const RATING_LABELS: Record<RatingScore, string> = {
  1: 'À éviter',
  2: 'Décevant',
  3: 'Correct',
  4: 'Très bien',
  5: 'Excellent',
};

/**
 * Les axes détaillés, facultatifs pour le joueur. Ils sont là parce qu'une
 * note globale ne dit pas POURQUOI : une salle notée 3 pour sa connexion et
 * une salle notée 3 pour son accueil n'ont pas le même problème à corriger,
 * et c'est le gérant qui lit ça.
 */
export const RATING_AXES = [
  { key: 'equipment', label: 'Équipement', hint: 'Manettes, écrans, consoles' },
  { key: 'connection', label: 'Connexion', hint: 'Débit et stabilité' },
  { key: 'comfort', label: 'Confort', hint: 'Place, sièges, propreté' },
  { key: 'staff', label: 'Accueil', hint: 'Personnel et organisation' },
] as const;

/** Clé d'un axe détaillé. */
export type RatingAxis = (typeof RATING_AXES)[number]['key'];

/** Longueur maximale d'un commentaire — la base coupe au même endroit. */
export const RATING_COMMENT_MAX = 500;

/** Ramène n'importe quel nombre à une note entière valide. */
export function clampScore(value: number): RatingScore {
  if (!Number.isFinite(value)) return RATING_MIN as RatingScore;
  const rounded = Math.round(value);
  if (rounded <= RATING_MIN) return RATING_MIN as RatingScore;
  if (rounded >= RATING_MAX) return RATING_MAX as RatingScore;
  return rounded as RatingScore;
}

/** « Très bien » pour 4, pour 4,2 comme pour 3,6 — l'arrondi est le même partout. */
export function ratingLabel(value: number): string {
  return RATING_LABELS[clampScore(value)];
}

/**
 * La moyenne telle qu'elle s'écrit : une décimale, virgule française, et un
 * tiret cadratin quand personne n'a encore noté. JAMAIS « 0 » — une salle
 * sans avis n'est pas une salle nulle, et l'afficher ainsi la condamne.
 */
export function formatRatingAverage(average: number | null | undefined): string {
  if (average === null || average === undefined || !Number.isFinite(average)) {
    return '—';
  }
  return average.toFixed(1).replace('.', ',');
}

/** « Aucun avis » / « 1 avis » / « 12 avis ». */
export function ratingCountLabel(count: number | null | undefined): string {
  const n = Number.isFinite(count) ? Math.max(0, Math.trunc(count as number)) : 0;
  if (n === 0) return 'Aucun avis';
  return `${n} avis`;
}

/**
 * Remplissage de chaque étoile, de 0 à 1. Une moyenne de 4,3 donne quatre
 * étoiles pleines et une remplie à 30 % — c'est ce qui distingue 4,1 de 4,9
 * sans écrire le chiffre deux fois.
 */
export function starFills(value: number | null | undefined, count = RATING_MAX): number[] {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(count, value as number)) : 0;
  return Array.from({ length: count }, (_, i) => {
    const fill = v - i;
    if (fill <= 0) return 0;
    if (fill >= 1) return 1;
    // Arrondi au centième : la valeur part en largeur CSS et en `width` de
    // masque natif. Sans lui, 4,3 donne 0,30000000000000027 — deux plateformes
    // qui ne coupent pas au même chiffre dessinent deux étoiles différentes.
    return Math.round(fill * 100) / 100;
  });
}

/** Une ligne d'histogramme des notes. */
export interface RatingBar {
  score: RatingScore;
  count: number;
  /** Part du total, en pourcentage arrondi (0 quand il n'y a aucun avis). */
  percent: number;
}

/**
 * Histogramme des cinq notes, de 5 à 1. Le pourcentage est celui du TOTAL,
 * pas celui de la note la plus fréquente : une barre pleine doit vouloir dire
 * « tout le monde », sinon deux salles ne se comparent pas d'un coup d'œil.
 */
export function ratingDistribution(
  counts: Partial<Record<RatingScore, number>> | null | undefined,
): RatingBar[] {
  const safe = counts ?? {};
  const total = RATING_SCORES.reduce((sum, score) => sum + Math.max(0, safe[score] ?? 0), 0);
  return RATING_SCORES.map((score) => {
    const count = Math.max(0, safe[score] ?? 0);
    return {
      score,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
}

/**
 * Où en est le droit de noter d'un joueur sur une salle. C'est l'API qui
 * tranche (elle seule voit les séances et les abonnements) ; l'interface se
 * contente d'afficher le bon message.
 */
export type RatingGate = 'open' | 'needs_account' | 'needs_paid_session' | 'closed';

/**
 * Ce qu'on dit au joueur qui ne peut pas noter. Le refus explique la
 * CONDITION, jamais « accès refusé » : l'utilisateur doit savoir quoi faire
 * pour y avoir droit (UX.md — ne jamais laisser un écran sans issue).
 */
export const RATING_GATE_MESSAGE: Record<RatingGate, string> = {
  open: 'Donne ton avis sur la salle.',
  needs_account: 'Connecte-toi pour donner ton avis sur cette salle.',
  needs_paid_session:
    'Les avis sont réservés aux joueurs qui ont payé une séance ou un abonnement ici. Joue une séance, tu pourras noter juste après.',
  closed: 'Les avis sont fermés sur cette salle.',
};
