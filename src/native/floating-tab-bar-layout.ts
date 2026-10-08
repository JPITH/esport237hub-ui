/**
 * Gabarit de la barre d’onglets en pilule (`FloatingTabBar`) — PUR et testé
 * (`floating-tab-bar-layout.test.ts`). À part de `floating-tab-bar.tsx` : `bun test`
 * ne sait pas charger `react-native`.
 *
 * La pilule FLOTTE au-dessus du contenu (décision du 07/10/2026) : chaque
 * écran à onglets doit donc réserver sous son contenu la hauteur de la
 * pilule, son écart au bas de l'écran et un peu d'air — sinon la dernière
 * ligne d'une liste reste cachée dessous, sans moyen de la faire remonter.
 */

/** Hauteur de la pilule : une rangée d'onglets de 52 px et 6 px de marge. */
export const PILL_HEIGHT = 64;
/** Hauteur d'un onglet — au-dessus des 44 px exigés (DESIGN.md). */
export const PILL_ITEM_HEIGHT = 52;
/** Marge intérieure de la pilule, autour des onglets. */
export const PILL_PADDING = 6;
/** Marge latérale de la pilule — la gouttière de 16 px des écrans. */
export const PILL_SIDE_MARGIN = 16;
/** Écart minimal entre la pilule et le bas de l'écran (téléphone sans encoche). */
export const PILL_MIN_BOTTOM_GAP = 12;
/** Air laissé entre la fin du contenu et le haut de la pilule. */
export const CONTENT_BREATHING = 16;
/**
 * Part de la largeur que prend l'onglet actif, en unités de `flexGrow` : les
 * inactifs valent 1. À 2,2 sur 390 px, l'actif tient « Boutique » en entier
 * à côté de son icône, et les deux autres gardent une cible de plus de 70 px.
 */
export const ACTIVE_GROW = 2.2;
/** Durée de l'élargissement d'un onglet — sous le seuil où l'on attend. */
export const TAB_TRANSITION_MS = 240;

/**
 * Distance entre le bas de l'écran et le bas de la pilule.
 *
 * Sur un téléphone à barre d'accueil (iPhone, Android à gestes), la zone sûre
 * suffit : la pilule se pose juste au-dessus. Sans zone sûre, on garde un
 * écart minimal — collée au bord, elle redeviendrait une barre.
 */
export function tabBarBottomOffset(safeAreaBottom: number): number {
  const inset = Number.isFinite(safeAreaBottom) ? Math.max(0, safeAreaBottom) : 0;
  return Math.max(inset, PILL_MIN_BOTTOM_GAP);
}

/**
 * Réserve à laisser sous le contenu d'un écran à onglets, zone sûre
 * COMPRISE — contrairement à l'ancienne `TAB_BAR_SPACE` (barre `E237TabBar`,
 * retirée le 08/10/2026), qu'il fallait additionner à `insets.bottom`. Les deux
 * ne s'additionnent plus : la pilule repose SUR la zone sûre, elle ne s'y
 * ajoute pas.
 */
export function tabBarReserve(safeAreaBottom: number): number {
  return tabBarBottomOffset(safeAreaBottom) + PILL_HEIGHT + CONTENT_BREATHING;
}
