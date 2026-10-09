/**
 * Le MOUVEMENT du signe pour l'écran de chargement (retour du porteur,
 * 08/10/2026 : « l'écran de chargement : il faut un motion design du logo,
 * plutôt qu'un spinner et le texte "chargement" »).
 *
 * Rien ici ne dessine : les tracés restent ceux de `brand-mark.ts`, et seulement
 * eux. Ce module ne fait que MESURER ces tracés (pour tracer le cadre « à la
 * plume » avec un pointillé) et donner la partition du mouvement, la même pour
 * le web (CSS) et le natif (Reanimated) :
 *
 *   0 %  ──── 40 %  le cadre hexagonal se trace (contour extérieur puis intérieur)
 *   35 % ──── 55 %  il se remplit, le trait s'efface ; le « G » monte
 *   45 % ──── 62 %  le « H » arrive, puis la facette de la traverse
 *   62 % ──── 78 %  le signe complet respire une fois
 *   88 % ──── 100 % il s'efface, et tout recommence
 *
 * « Réduire les animations » : le signe complet, immobile.
 */

/** Durée d'un cycle complet, en millisecondes. */
export const BRAND_LOADER_CYCLE_MS = 2400;

/**
 * Les étapes du cycle, en fraction de `BRAND_LOADER_CYCLE_MS`. Le CSS du web
 * (`.e237-brand-loader*`, `components.css`) reprend ces pourcentages ; le
 * natif les interpole tels quels.
 */
export const BRAND_LOADER_TIMELINE = {
  ringDraw: [0, 0.4],
  ringFill: [0.35, 0.55],
  letterG: [0.3, 0.5],
  letterH: [0.45, 0.6],
  shade: [0.55, 0.62],
  breathe: [0.62, 0.78],
  fadeOut: [0.88, 1],
} as const;

/**
 * Longueur d'un tracé fait de segments droits (`M`, `L`, `Z` — tout le signe
 * l'est : « aucune courbe dans le jeu », DESIGN.md). Sert au pointillé qui
 * trace le cadre : `react-native-svg` ne connaît pas l'attribut `pathLength`.
 */
export function polylinePathLength(d: string): number {
  const tokens = d.trim().split(/[\s,]+/);
  let total = 0;
  let start: [number, number] | null = null;
  let last: [number, number] | null = null;
  for (let i = 0; i < tokens.length; ) {
    const cmd = tokens[i];
    if (cmd === 'M' || cmd === 'L') {
      const x = Number(tokens[i + 1]);
      const y = Number(tokens[i + 2]);
      if (cmd === 'L' && last) total += Math.hypot(x - last[0], y - last[1]);
      if (cmd === 'M') start = [x, y];
      last = [x, y];
      i += 3;
    } else if (cmd === 'Z' || cmd === 'z') {
      if (start && last) total += Math.hypot(start[0] - last[0], start[1] - last[1]);
      last = start;
      i += 1;
    } else {
      // Commande inconnue : le tracé n'est plus un polygone, on ne devine pas.
      return Number.NaN;
    }
  }
  return total;
}

/** Interpolation linéaire bornée d'une étape du cycle (0 avant, 1 après). */
export function stageProgress(t: number, [from, to]: readonly [number, number]): number {
  if (t <= from) return 0;
  if (t >= to) return 1;
  return (t - from) / (to - from);
}
