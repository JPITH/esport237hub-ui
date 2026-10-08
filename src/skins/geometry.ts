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
import { mapPath, parsePath, serializePath } from './shapes/path';
import {
  CARD_SHAPE_NAMES,
  CARD_SHAPE_SOURCES,
  CARD_SHAPE_VIEW,
  type CardShapeName,
} from './shapes/generated';

export { CARD_SHAPE_NAMES, type CardShapeName };

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
 * Gabarit du VERSO (stats détaillées), même convention que `CARD_LAYOUT` :
 * des fractions de la carte, lues par le natif (`player-card-back`) et le web
 * (`PlayerCardBack`). Les blocs restent dans la partie large du bouclier — la
 * pointe basse commence à 73 % de la hauteur, le bilan s'arrête avant.
 */
export const CARD_BACK_LAYOUT = {
  /** « STATISTIQUES » + points de carrière. */
  title: { top: 0.088, left: 0.16, width: 0.68 },
  /** Six axes de stats, libellé complet + jauge. */
  stats: { top: 0.15, left: 0.15, width: 0.7, height: 0.42 },
  /** Bilan en deux lignes de deux cases. */
  record: { top: 0.595, left: 0.17, width: 0.66 },
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
export function cardLayoutCssVars(shape?: string | null): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [block, box] of Object.entries(cardShape(shape).layout)) {
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
/* Formes de carte                                                            */
/* ========================================================================== */

/**
 * Forme par défaut : le bouclier crénelé. Un skin sans `shape` (tous ceux
 * écrits avant l'arrivée des formes) la garde, au pixel près.
 */
export const DEFAULT_CARD_SHAPE: CardShapeName = 'bouclier';

/** Vrai si la valeur nomme une forme connue. */
export function isCardShapeName(value: unknown): value is CardShapeName {
  return typeof value === 'string' && (CARD_SHAPE_NAMES as readonly string[]).includes(value);
}

/** Gabarit du recto, valeurs élargies en `number` (une forme les déplace). */
export type CardLayout = {
  readonly [K in keyof typeof CARD_LAYOUT]: {
    readonly [P in keyof (typeof CARD_LAYOUT)[K]]: number;
  };
};
/** Gabarit du verso, même convention. */
export type CardBackLayout = {
  readonly [K in keyof typeof CARD_BACK_LAYOUT]: {
    readonly [P in keyof (typeof CARD_BACK_LAYOUT)[K]]: number;
  };
};

/** Rectangle en FRACTION de la carte. */
export interface ShapeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tout ce que le rendu doit savoir d'une forme. Les chemins sont dans le
 * repère du tracé (`0 0 300 CARD_REF_HEIGHT`) ; les boîtes et le gabarit en
 * fractions de la carte, comme `CARD_LAYOUT`.
 */
export interface CardShapeGeometry {
  name: CardShapeName;
  /** Nom affiché (éditeur de skins, planche). */
  label: string;
  description: string;
  /** Silhouette complète = liseré. Sert aussi de découpe (reflet, éclat). */
  framePath: string;
  /** Surface intérieure : fond, halos et rayures y sont découpés. */
  surfacePath: string;
  /**
   * Silhouette en unités de boîte (0 → 1), pour un `<clipPath
   * clipPathUnits="objectBoundingBox">` — `null` pour le bouclier, que le web
   * découpe en `polygon()` CSS comme avant.
   */
  clipUnit: string | null;
  /** Zone sûre : le contenu (recto et verso) y est replacé. */
  safe: ShapeBox;
  /** Boîte où le balayage « foil » court sans jamais sortir de la forme. */
  sheen: ShapeBox;
  /** Gabarit du recto, replacé dans la zone sûre. */
  layout: CardLayout;
  /** Gabarit du verso, replacé dans la zone sûre. */
  backLayout: CardBackLayout;
}

function polygonPath(points: string): string {
  return `M${points.split(' ').join('L')}Z`;
}

/** Chemin du repère de référence porté à une autre taille de tracé. */
function scalePath(d: string, width: number, height: number): string {
  const sx = width / CARD_BASE_WIDTH;
  const sy = height / CARD_REF_HEIGHT;
  return serializePath(mapPath(parsePath(d), (x, y) => [x * sx, y * sy]));
}

function boxFromSource(r: readonly [number, number, number, number]): ShapeBox {
  return {
    x: r[0] / CARD_SHAPE_VIEW.width,
    y: r[1] / CARD_SHAPE_VIEW.height,
    width: r[2] / CARD_SHAPE_VIEW.width,
    height: r[3] / CARD_SHAPE_VIEW.height,
  };
}

/**
 * Zone sûre de référence = celle du bouclier, pour laquelle `CARD_LAYOUT` et
 * `CARD_BACK_LAYOUT` ont été dessinés. Une autre forme déclare la sienne ; le
 * gabarit y est transposé par une simple homothétie par axe.
 */
const REFERENCE_SAFE = boxFromSource(CARD_SHAPE_SOURCES[DEFAULT_CARD_SHAPE].safe);

function remap<T extends Record<string, number>>(
  box: T,
  safe: ShapeBox,
  extra: Partial<Record<keyof T, number>> = {},
): { [K in keyof T]: number } {
  const sx = safe.width / REFERENCE_SAFE.width;
  const sy = safe.height / REFERENCE_SAFE.height;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(box)) {
    const forced = extra[k as keyof T];
    if (forced != null) out[k] = forced;
    else if (k === 'top') out[k] = safe.y + (v - REFERENCE_SAFE.y) * sy;
    else if (k === 'left') out[k] = safe.x + (v - REFERENCE_SAFE.x) * sx;
    else if (k === 'width') out[k] = v * sx;
    else if (k === 'height') out[k] = v * sy;
    else out[k] = v;
  }
  return out as { [K in keyof T]: number };
}

function geometryOf(name: CardShapeName): CardShapeGeometry {
  const src = CARD_SHAPE_SOURCES[name];
  if (name === DEFAULT_CARD_SHAPE) {
    /* Le bouclier reste calculé comme il l'a toujours été (CARD_SHAPE,
       retrait par homothétie) et garde ses gabarits d'origine : c'est la
       garantie qu'un skin existant ne bouge pas d'un pixel. `bouclier.svg`
       n'en est que la transcription, vérifiée par les tests. */
    return {
      name,
      label: src.label,
      description: src.description,
      framePath: polygonPath(shapePoints(CARD_BASE_WIDTH, CARD_REF_HEIGHT)),
      surfacePath: polygonPath(shapePoints(CARD_BASE_WIDTH, CARD_REF_HEIGHT, CARD_INSET)),
      clipUnit: null,
      safe: REFERENCE_SAFE,
      sheen: { x: 0, y: 0.08, width: 1, height: 0.8 },
      layout: CARD_LAYOUT,
      backLayout: CARD_BACK_LAYOUT,
    };
  }
  const safe = boxFromSource(src.safe);
  const L = CARD_LAYOUT;
  const B = CARD_BACK_LAYOUT;
  return {
    name,
    label: src.label,
    description: src.description,
    framePath: src.frame,
    surfacePath: src.surface,
    clipUnit: src.unit,
    safe,
    sheen: boxFromSource(src.sheen),
    layout: {
      crest: remap(L.crest, safe, { top: src.anchors.crest / CARD_SHAPE_VIEW.height }),
      badge: remap(L.badge, safe),
      portrait: remap(L.portrait, safe),
      identity: remap(L.identity, safe),
      stats: remap(L.stats, safe),
      footer: remap(L.footer, safe, { bottom: 1 - src.anchors.footer / CARD_SHAPE_VIEW.height }),
      flag: { ...L.flag },
    },
    backLayout: {
      title: remap(B.title, safe),
      stats: remap(B.stats, safe),
      record: remap(B.record, safe),
    },
  };
}

const SHAPE_CACHE = new Map<CardShapeName, CardShapeGeometry>();

/**
 * Géométrie d'une forme. Un nom inconnu, absent ou corrompu rend le
 * bouclier : comme pour les skins, une donnée douteuse ne casse jamais une
 * carte. Calculée une fois par forme.
 */
export function cardShape(name?: string | null): CardShapeGeometry {
  const key = isCardShapeName(name) ? name : DEFAULT_CARD_SHAPE;
  let g = SHAPE_CACHE.get(key);
  if (!g) {
    g = geometryOf(key);
    SHAPE_CACHE.set(key, g);
  }
  return g;
}

/** Toutes les formes, forme par défaut en tête (éditeur, planche, tests). */
export function cardShapes(): CardShapeGeometry[] {
  return CARD_SHAPE_NAMES.map((n) => cardShape(n));
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
  /**
   * Bornes horizontales de la boîte où court la bande (la forme la déclare :
   * pleine largeur pour le bouclier, en retrait pour un ticket). Le natif y
   * confine sa vue animée ; le web aussi, hors bouclier, qu'il découpe.
   */
  left: number;
  boxWidth: number;
  /** Translation X de départ et d'arrivée, relative à `left`. */
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
  /** Forme de la carte (`SkinSpec.shape` résolu). */
  shape: CardShapeName;
  /**
   * Chemin du liseré extérieur = silhouette complète, à la taille du tracé.
   * Pour le bouclier : le polygone historique, `M x,y L x,y … Z`.
   */
  framePath: string;
  /** Chemin de la surface intérieure (fond, halos, rayures y sont découpés). */
  surfacePath: string;
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
  const shape = cardShape(skin.shape);
  const atRef = width === CARD_BASE_WIDTH && height === CARD_REF_HEIGHT;
  const sized = (d: string) => (atRef ? d : scalePath(d, width, height));
  const isDefault = shape.name === DEFAULT_CARD_SHAPE;
  const box = shape.sheen;
  const boxWidth = box.width * width;

  return {
    width,
    height,
    shape: shape.name,
    framePath: isDefault ? polygonPath(shapePoints(width, height)) : sized(shape.framePath),
    surfacePath: isDefault
      ? polygonPath(shapePoints(width, height, CARD_INSET))
      : sized(shape.surfacePath),
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
          top: height * box.y,
          height: height * box.height,
          left: width * box.x,
          boxWidth,
          width: bandWidth,
          skewDeg: sheenSpec.skewDeg,
          from: -bandWidth * 1.6,
          to: boxWidth + bandWidth,
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
