/**
 * Géométrie du curseur de défilement maison (`ScrollIndicator`).
 *
 * Sortie de `scroll.tsx` pour la même raison que `sheet-snap.ts` : c'est la
 * seule logique non triviale du composant (taille proportionnelle, plancher,
 * rebond iOS, liste inversée) et elle se teste ici sans monter React Native.
 * Les fonctions portent `'worklet'` : elles tournent sur le fil UI, à chaque
 * image du défilement, sans repasser par React.
 */

/** Plus petite longueur du curseur : en dessous, le pouce ne le voit plus. */
export const THUMB_MIN = 36;

/**
 * Plancher de l'écrasement au rebond (iOS tire le contenu au-delà de ses
 * bords) : le curseur rétrécit comme celui du système, sans disparaître.
 */
export const THUMB_SQUISH_MIN = 10;

/** Écart sous lequel on tient le contenu pour « tient dans la vue ». */
const FITS_EPSILON = 1;

export interface ScrollThumbInput {
  /** Longueur visible de la vue défilante (hauteur, ou largeur à l'horizontale). */
  viewport: number;
  /** Longueur totale du contenu. */
  content: number;
  /** Défilement courant ; < 0 ou > max pendant le rebond iOS. */
  offset: number;
  /** Marge laissée en tête de piste (sous une barre collante, par exemple). */
  insetStart?: number;
  /** Marge laissée en fin de piste (au-dessus d'une barre d'onglets flottante). */
  insetEnd?: number;
  /** Longueur plancher du curseur. */
  minSize?: number;
  /** Liste inversée (`inverted`) : le début du contenu est en BAS de l'écran. */
  inverted?: boolean;
}

export interface ScrollThumb {
  /** Faux quand le contenu tient dans la vue : rien à montrer. */
  scrollable: boolean;
  /** Longueur du curseur, en points. */
  size: number;
  /** Décalage du curseur depuis le bord de tête de la vue, en points. */
  position: number;
}

function clamp(value: number, min: number, max: number): number {
  'worklet';
  return value < min ? min : value > max ? max : value;
}

/**
 * Taille et position du curseur pour un état de défilement.
 *
 * - La taille suit la part visible du contenu (`viewport / content`) sur la
 *   longueur de la piste, avec un plancher (`minSize`) : un fil de 300
 *   commentaires garde un curseur qu'on voit.
 * - La position suit la progression (`offset / (content - viewport)`), sur la
 *   course qui reste une fois le curseur posé (`piste - taille`).
 * - Au rebond, le curseur reste collé à son bord et rétrécit de la distance
 *   tirée, comme celui d'iOS.
 */
export function scrollThumb({
  viewport,
  content,
  offset,
  insetStart = 0,
  insetEnd = 0,
  minSize = THUMB_MIN,
  inverted = false,
}: ScrollThumbInput): ScrollThumb {
  'worklet';
  const track = viewport - insetStart - insetEnd;
  const maxOffset = content - viewport;
  if (!(track > 0) || !(viewport > 0) || !(maxOffset > FITS_EPSILON)) {
    return { scrollable: false, size: 0, position: insetStart };
  }

  const floor = Math.min(minSize, track);
  const proportional = (track * viewport) / content;
  const base = clamp(proportional, floor, track);

  // Rebond : la distance tirée au-delà d'un bord.
  const over = offset < 0 ? -offset : offset > maxOffset ? offset - maxOffset : 0;
  const size = Math.max(Math.min(base, THUMB_SQUISH_MIN), base - over);

  const progress = clamp(offset / maxOffset, 0, 1);
  const travel = track - size;
  const along = inverted ? 1 - progress : progress;
  return { scrollable: true, size, position: insetStart + along * travel };
}

/**
 * Durées de l'apparition du curseur (ms) : il s'allume au premier mouvement,
 * reste le temps de lire où l'on est, puis s'efface — comme celui d'iOS.
 * En « réduire les animations », pas de fondu : il apparaît et disparaît net.
 */
export function thumbTimings(reducedMotion: boolean): {
  fadeIn: number;
  hold: number;
  fadeOut: number;
} {
  'worklet';
  return reducedMotion
    ? { fadeIn: 0, hold: 900, fadeOut: 0 }
    : { fadeIn: 90, hold: 700, fadeOut: 280 };
}

/** Clés de style qui placent la vue défilante dans SON parent. */
const OUTER_KEYS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'start',
  'end',
  'inset',
  'insetBlock',
  'insetInline',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'aspectRatio',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginStart',
  'marginEnd',
  'marginHorizontal',
  'marginVertical',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'zIndex',
  'display',
  'opacity',
  'transform',
]);

/**
 * Le curseur est dessiné PAR-DESSUS la vue défilante, dans une enveloppe : la
 * place de la vue dans son parent (flex, marges, tailles, position) passe à
 * l'enveloppe ; son apparence (fond, bordure, rembourrage) reste sur la vue.
 *
 * Les deux reçoivent d'abord le `flexGrow: 1, flexShrink: 1` qu'une
 * `ScrollView` de React Native a par défaut : une vue défilante posée sans
 * style continue de remplir son parent, et une vue « à la taille de son
 * contenu » (feuille) continue de rendre la main sous un plafond de hauteur.
 */
export function splitScrollStyle(style: Record<string, unknown> | null | undefined): {
  outer: Record<string, unknown>;
  inner: Record<string, unknown>;
} {
  const outer: Record<string, unknown> = { flexGrow: 1, flexShrink: 1 };
  const inner: Record<string, unknown> = { flexGrow: 1, flexShrink: 1 };
  if (!style) return { outer, inner };
  for (const key of Object.keys(style)) {
    const value = style[key];
    if (value === undefined) continue;
    if (OUTER_KEYS.has(key)) outer[key] = value;
    else inner[key] = value;
  }
  // `flex: n` fixe aussi la croissance et le rétrécissement : ne pas laisser
  // les défauts ci-dessus le contredire.
  if (typeof outer.flex === 'number') {
    if (style.flexGrow === undefined) delete outer.flexGrow;
    if (style.flexShrink === undefined) delete outer.flexShrink;
  }
  return { outer, inner };
}
