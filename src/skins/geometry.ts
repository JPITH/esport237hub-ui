/**
 * Géométrie de la carte « Founders » — calculs PARTAGÉS web / iOS / Android.
 *
 * Ce module ne connaît ni le DOM ni React Native : il transforme un `SkinSpec`
 * et une taille de rendu en une « liste de tracé » (`SkinDraw`) que chaque
 * plateforme mappe 1:1 sur ses primitives SVG.
 *
 *   web    → <svg><polygon/><linearGradient/>…      (src/web/card-chrome.tsx)
 *   native → react-native-svg, mêmes éléments        (src/native/card-skins.tsx)
 *
 * C'est la garantie mathématique de parité : même polygone, mêmes arrêts de
 * dégradé, mêmes rayures, aux mêmes coordonnées.
 */
import type { SkinSpec, SkinStripes } from './spec';

/** Largeur de référence : toutes les tailles fixes sont dessinées pour 300 px. */
export const CARD_BASE_WIDTH = 300;

/** Ratio d'une carte à collectionner (63 × 88 mm) — hauteur = largeur / ratio. */
export const CARD_ASPECT = 63 / 88;

/**
 * Hauteur de référence. Le tracé est TOUJOURS calculé à 300 × 419,05 puis mis
 * à l'échelle par le `viewBox` du SVG : aucune mesure n'est nécessaire, le
 * rendu est disponible dès la première frame, et comme les motifs sont exprimés
 * en fraction de la largeur, leur densité visuelle reste identique à toute
 * taille d'affichage — sur les trois plateformes.
 */
export const CARD_REF_HEIGHT = CARD_BASE_WIDTH / CARD_ASPECT;

/**
 * Retrait de la surface intérieure vers le centre : le liseré fait donc 2,8 %
 * de chaque côté (identique à l'`inset: 2.8%` du web historique).
 */
export const CARD_INSET = 0.056;

/**
 * Sommets du bouclier crénelé, en fraction de la largeur / hauteur.
 * Forme de marque : elle ne dépend pas du skin.
 */
export const CARD_SHAPE: ReadonlyArray<readonly [number, number]> = [
  [0.16, 0.03],
  [0.38, 0.01],
  [0.5, 0.04],
  [0.62, 0.01],
  [0.84, 0.03],
  [0.96, 0.11],
  [0.98, 0.73],
  [0.9, 0.88],
  [0.5, 1],
  [0.1, 0.88],
  [0.02, 0.73],
  [0.04, 0.11],
];

/**
 * Échelle typographique : 1 = carte de référence (300 px). Bornée pour qu'une
 * carte plein écran ne devienne pas gigantesque ni une vignette illisible.
 * Équivalent web : `--pc-k: clamp(0.5, 100cqw / 300, 1.2)`.
 */
export function cardScale(width: number): number {
  return Math.min(1.2, Math.max(0.5, width / CARD_BASE_WIDTH));
}

/**
 * Position des blocs de contenu, en FRACTION de la carte — source unique du
 * gabarit, consommée par les deux plateformes :
 *   - web    : exposée en variables `--pc-l-*` (voir `cardLayoutCssVars`)
 *   - native : convertie en pourcentages par `makeStyles` de player-card
 *
 * Sans ce partage, les deux gabarits dérivent : le natif plaçait la colonne
 * badge à ~6,7 % (un padding fixe de 20 px) là où le web la place à 12 %, et
 * l'OVR chevauchait le liseré du bouclier.
 */
export const CARD_LAYOUT = {
  /** Plaque jeu, centrée sur le haut du liseré. */
  crest: { top: 0.012, maxWidth: 0.6 },
  /** Colonne OVR / ville / drapeau / division. */
  badge: { top: 0.125, left: 0.12, width: 0.23 },
  /** Zone portrait (photo détourée ou silhouette de repli). */
  portrait: { top: 0.105, left: 0.25, width: 0.68, height: 0.53 },
  /** Bandeau nom + palmarès. */
  identity: { top: 0.555, left: 0.14, width: 0.72 },
  /** Grille de stats sur deux colonnes. */
  stats: { top: 0.685, left: 0.15, width: 0.7 },
  /** Pied de carte (marque du hub). */
  footer: { bottom: 0.068, left: 0.25, width: 0.5 },
  /** Drapeau, en fraction de la LARGEUR DU BADGE. */
  flag: { width: 0.52, marginTop: 0.13 },
} as const;

/**
 * `0.125` → `'12.5%'`. Le type littéral est indispensable côté React Native :
 * `DimensionValue` n'accepte pas un `string` quelconque.
 */
export function pct(fraction: number): `${number}%` {
  return `${Number((fraction * 100).toFixed(4))}%`;
}

/**
 * Arrondi des coins du drapeau, en px à la largeur de référence — le SEUL
 * habillage qu'il conserve (ni bordure, ni ombre). Le natif le multiplie par
 * l'échelle de la carte, le web le reçoit en variable CSS.
 */
export const FLAG_RADIUS = 3;

/** Gabarit en variables CSS, pour les règles `.pcard__*` de components.css. */
export function cardLayoutCssVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [block, box] of Object.entries(CARD_LAYOUT)) {
    for (const [side, value] of Object.entries(box)) {
      vars[`--pc-l-${block}-${side.toLowerCase()}`] = pct(value as number);
    }
  }
  vars['--pc-l-flag-radius'] = `${FLAG_RADIUS}px`;
  return vars;
}

/** Hauteur induite par la largeur, au ratio de carte. */
export function cardHeight(width: number): number {
  return width / CARD_ASPECT;
}

/**
 * Points du bouclier au format SVG `x,y x,y …`.
 * `inset` réduit le polygone vers son centre (0 = liseré, CARD_INSET = surface).
 */
export function shapePoints(width: number, height: number, inset = 0): string {
  const k = 1 - inset;
  return CARD_SHAPE.map(
    ([x, y]) =>
      `${((0.5 + (x - 0.5) * k) * width).toFixed(2)},${((0.5 + (y - 0.5) * k) * height).toFixed(2)}`,
  ).join(' ');
}

/** Même forme au format CSS `polygon(…)` — pour les `clip-path` web. */
export function shapeClipPath(inset = 0): string {
  const k = 1 - inset;
  const pct = (v: number) => `${((0.5 + (v - 0.5) * k) * 100).toFixed(2)}%`;
  return `polygon(${CARD_SHAPE.map(([x, y]) => `${pct(x)} ${pct(y)}`).join(', ')})`;
}

/* ========================================================================== */
/* Liste de tracé                                                             */
/* ========================================================================== */

export interface DrawStop {
  color: string;
  offset: number;
  opacity?: number;
}

export interface DrawLinear {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: DrawStop[];
}

export interface DrawRadial {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity: number;
}

export interface DrawLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity: number;
  width: number;
}

/**
 * Bande « foil » : la géométrie est en pixels, l'animation en millisecondes.
 * Le web l'anime en CSS `@keyframes`, le natif en Reanimated — mêmes nombres.
 */
export interface DrawSheen {
  color: string;
  opacity: number;
  /** Boîte de la bande. */
  top: number;
  height: number;
  width: number;
  skewDeg: number;
  /** Translation X de départ et d'arrivée. */
  from: number;
  to: number;
  travelMs: number;
  holdMs: number;
  /** Durée du cycle complet (balayage + attente). */
  periodMs: number;
}

export interface SkinDraw {
  width: number;
  height: number;
  /** Polygone du liseré extérieur. */
  framePoints: string;
  /** Polygone de la surface intérieure. */
  surfacePoints: string;
  frame: DrawLinear;
  surface: DrawLinear;
  radials: DrawRadial[];
  stripes: DrawLine[];
  /** Identifiant du `clipPath` limitant halos et rayures à la surface. */
  clipId: string;
  /** Couleur de l'anneau intérieur brillant. */
  inner: string;
  sheen?: DrawSheen;
}

/** Rayures d'un motif, en coordonnées pixels. */
function stripeLines(spec: SkinStripes, width: number, height: number): DrawLine[] {
  const step = Math.max(2, spec.spacing * width);
  const strokeWidth = Math.max(0.5, spec.width * width);
  const lines: DrawLine[] = [];
  const primary = { color: spec.color, opacity: spec.opacity, width: strokeWidth };
  const secondary = {
    color: spec.color2 ?? spec.color,
    opacity: spec.opacity2 ?? spec.opacity,
    width: strokeWidth,
  };

  if (spec.pattern === 'scanline') {
    for (let y = step; y < height; y += step) {
      lines.push({ x1: 0, y1: y, x2: width, y2: y, ...primary });
    }
    return lines;
  }

  /* Traits inclinés : la pente est un rapport dx/dy, donc indépendante du ratio. */
  const dx = spec.slope * height;
  for (let x = -height; x < width + height; x += step) {
    lines.push({ x1: x, y1: height, x2: x + dx, y2: 0, ...primary });
    if (spec.pattern === 'chevron') {
      lines.push({ x1: x + dx, y1: height, x2: x, y2: 0, ...secondary });
    }
  }
  return lines;
}

/**
 * Traduit un skin en liste de tracé, à la taille de référence par défaut
 * (le `viewBox` du SVG se charge de l'échelle).
 *
 * `uid` préfixe les identifiants des dégradés : indispensable côté web, où
 * plusieurs cartes coexistent dans un même document et où des `id` dupliqués
 * feraient gagner le premier `<defs>` rencontré.
 */
export function buildSkinDraw(
  skin: SkinSpec,
  uid: string,
  width: number = CARD_BASE_WIDTH,
  height: number = CARD_REF_HEIGHT,
): SkinDraw {
  const sheenSpec = skin.sheen;
  const bandWidth = sheenSpec ? sheenSpec.width * width : 0;

  return {
    width,
    height,
    framePoints: shapePoints(width, height),
    surfacePoints: shapePoints(width, height, CARD_INSET),
    frame: { id: `${uid}-frame`, ...skin.frame },
    surface: { id: `${uid}-surface`, ...skin.surface },
    radials: skin.radials.map((r, i) => ({ id: `${uid}-radial-${i}`, ...r })),
    stripes: skin.stripes ? stripeLines(skin.stripes, width, height) : [],
    clipId: `${uid}-clip`,
    inner: skin.inner,
    sheen: sheenSpec
      ? {
          color: sheenSpec.color,
          opacity: sheenSpec.opacity,
          top: height * 0.08,
          height: height * 0.8,
          width: bandWidth,
          skewDeg: sheenSpec.skewDeg,
          from: -bandWidth * 1.6,
          to: width + bandWidth,
          travelMs: sheenSpec.travelMs,
          holdMs: sheenSpec.holdMs,
          periodMs: sheenSpec.travelMs + sheenSpec.holdMs,
        }
      : undefined,
  };
}

/**
 * Vrai si les effets animés doivent tourner : skin premium, ou forçage
 * (aperçu de l'éditeur de skins).
 */
export function skinAnimated(skin: SkinSpec, force = false): boolean {
  return Boolean(skin.sheen) && (skin.premium || force);
}
