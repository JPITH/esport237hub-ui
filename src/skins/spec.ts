/**
 * SkinSpec — SOURCE DE VÉRITÉ UNIQUE du design des cartes joueur.
 *
 * Un skin est une DONNÉE pure, sérialisable en JSON, stockée telle quelle dans
 * `products.design` (jsonb). Le même objet est rendu par :
 *   - le web      → `@esport237hub/ui/web`   (SVG DOM)
 *   - iOS/Android → `@esport237hub/ui/native` (react-native-svg)
 *
 * Conséquence : un skin créé dans le dashboard admin s'affiche à l'identique
 * sur les trois plateformes, sans une ligne de code à écrire. AUCUNE couleur de
 * carte ne doit être écrite ailleurs (ni CSS `.pcard--*`, ni constante native) —
 * tout passe par ce module.
 *
 * Fichier volontairement SANS DÉPENDANCE : il est importé par NestJS (validation
 * + seed), par Next.js et par Expo.
 */

/** Version du schéma. Incrémenter uniquement sur un changement incompatible. */
export const SKIN_SPEC_VERSION = 1;

/** Un arrêt de dégradé : couleur + position dans [0,1]. */
export interface SkinStop {
  color: string;
  offset: number;
}

/**
 * Dégradé linéaire exprimé en coordonnées fractionnaires de la carte
 * (0,0 = coin haut-gauche ; 1,1 = coin bas-droit) — indépendant de la taille
 * de rendu, donc identique web et natif.
 */
export interface SkinLinear {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: SkinStop[];
}

/**
 * Halo radial posé par-dessus la surface. Centre et rayon en fraction de la
 * carte ; le centre PEUT sortir de [0,1] (halo qui déborde par le haut).
 */
export interface SkinRadial {
  color: string;
  opacity: number;
  cx: number;
  cy: number;
  r: number;
}

/** Motifs de rayures décoratives disponibles. */
export const SKIN_STRIPE_PATTERNS = ['diagonal', 'chevron', 'scanline'] as const;
export type SkinStripePattern = (typeof SKIN_STRIPE_PATTERNS)[number];

/**
 * Rayures décoratives. `spacing`, `width` et `slope` sont en FRACTION de la
 * largeur de la carte : c'est ce qui garantit que le motif a la même densité
 * visuelle sur une carte de 220 px (mobile) et de 420 px (dashboard).
 */
export interface SkinStripes {
  pattern: SkinStripePattern;
  color: string;
  opacity: number;
  /** Seconde couleur (chevrons toghu jaune/rouge). */
  color2?: string;
  opacity2?: number;
  /** Écart entre deux rayures, en fraction de la largeur. */
  spacing: number;
  /** Épaisseur du trait, en fraction de la largeur. */
  width: number;
  /** Pente dx/dy du trait (0 = vertical, 1 = 45°). Ignorée par `scanline`. */
  slope: number;
}

/** Balayage « foil » périodique des skins premium. */
export interface SkinSheen {
  color: string;
  /** Opacité au pic du dégradé. */
  opacity: number;
  /** Largeur de la bande, en fraction de la largeur de la carte. */
  width: number;
  skewDeg: number;
  /** Durée du balayage. */
  travelMs: number;
  /** Temps d'attente entre deux balayages. */
  holdMs: number;
}

/** Halo extérieur qui « respire » (braise, néon…). */
export interface SkinGlow {
  color: string;
  periodMs: number;
}

/**
 * Design complet d'une carte. Tout est optionnel à la lecture (voir
 * `parseSkinSpec`) mais toujours complet après normalisation.
 */
export interface SkinSpec {
  version: number;
  /** Clé stable = `products.skin_key` / `player_skins.skin_key`. */
  key: string;
  label: string;
  /** Vendable en boutique → active le foil et le halo. */
  premium: boolean;
  /** Encre du texte, filets de séparation, accent. */
  ink: string;
  line: string;
  accent: string;
  /** Liseré extérieur (cadre métal). */
  frame: SkinLinear;
  /** Surface intérieure. */
  surface: SkinLinear;
  radials: SkinRadial[];
  stripes?: SkinStripes;
  /** Bordure des chips (plaque jeu, division, pied). */
  border: string;
  /** Anneau intérieur brillant. */
  inner: string;
  sheen?: SkinSheen;
  glow?: SkinGlow;
}

/* ========================================================================== */
/* Utilitaires couleur (purs, sans dépendance)                                */
/* ========================================================================== */

/** `#abc` / `#aabbcc` / `#aabbccdd` → composantes 0-255 (+ alpha 0-1). */
function parseHex(hex: string): { r: number; g: number; b: number; a: number } | null {
  const m = /^#([0-9a-f]{3,8})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1];
  const dup = (c: string) => parseInt(c + c, 16);
  if (h.length === 3 || h.length === 4) {
    return {
      r: dup(h[0]),
      g: dup(h[1]),
      b: dup(h[2]),
      a: h.length === 4 ? dup(h[3]) / 255 : 1,
    };
  }
  if (h.length === 6 || h.length === 8) {
    const at = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: at(0), g: at(2), b: at(4), a: h.length === 8 ? at(6) / 255 : 1 };
  }
  return null;
}

/** `rgb()` / `rgba()` → composantes. */
function parseRgb(css: string): { r: number; g: number; b: number; a: number } | null {
  const m = /^rgba?\(([^)]+)\)$/i.exec(css.trim());
  if (!m) return null;
  const parts = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
  return {
    r: parts[0],
    g: parts[1],
    b: parts[2],
    a: parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1,
  };
}

/** Toute couleur CSS simple (hex ou rgb/rgba) → composantes, sinon `null`. */
export function parseColor(css: string): { r: number; g: number; b: number; a: number } | null {
  if (typeof css !== 'string') return null;
  return parseHex(css) ?? parseRgb(css);
}

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** Mélange `ratio` (0-1) de `b` dans `a`. Renvoie `a` si l'un est illisible. */
export function mixColor(a: string, b: string, ratio: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  const t = Math.max(0, Math.min(1, ratio));
  const hex = (n: number) => clamp255(n).toString(16).padStart(2, '0');
  return `#${hex(ca.r + (cb.r - ca.r) * t)}${hex(ca.g + (cb.g - ca.g) * t)}${hex(
    ca.b + (cb.b - ca.b) * t,
  )}`;
}

/** Même couleur avec une opacité imposée — toujours en `rgba()`. */
export function withAlpha(css: string, alpha: number): string {
  const c = parseColor(css);
  if (!c) return css;
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${clamp255(c.r)},${clamp255(c.g)},${clamp255(c.b)},${Number(a.toFixed(3))})`;
}

/** Éclaircit vers le blanc. */
export function lighten(css: string, ratio: number): string {
  return mixColor(css, '#ffffff', ratio);
}

/** Assombrit vers le noir. */
export function darken(css: string, ratio: number): string {
  return mixColor(css, '#000000', ratio);
}

/**
 * Luminance relative (WCAG) — sert à choisir automatiquement une encre lisible
 * sur un fond quelconque (skins créés dans le dashboard).
 */
export function luminance(css: string): number {
  const c = parseColor(css);
  if (!c) return 0;
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(c.r) + 0.7152 * chan(c.g) + 0.0722 * chan(c.b);
}

/** Encre lisible (clair sur fond sombre, sombre sur fond clair). */
export function readableInk(background: string): string {
  return luminance(background) > 0.45 ? '#1b1205' : '#f4f8ff';
}

/* ========================================================================== */
/* Gabarits de dégradés et de rayures                                         */
/* ========================================================================== */

/** Liseré : diagonale haut-gauche → bas-droit, arrêts 0 / 0.45 / 1. */
export function frameLinear(hi: string, mid: string, low: string): SkinLinear {
  return {
    x1: 0,
    y1: 0,
    x2: 1,
    y2: 1,
    stops: [
      { color: hi, offset: 0 },
      { color: mid, offset: 0.45 },
      { color: low, offset: 1 },
    ],
  };
}

/**
 * Couleur du n-ième arrêt d'un dégradé, index borné.
 * Les corps de carte s'en servent pour teinter les chips et les bordures
 * (`stopColor(skin.frame, 0)` = clair du cadre) sans manipuler les tableaux.
 */
export function stopColor(gradient: SkinLinear, index: number): string {
  const stops = gradient.stops;
  const i = Math.max(0, Math.min(stops.length - 1, Math.round(index)));
  return stops[i]?.color ?? '#000000';
}

/** Surface : quasi vertical (légère inclinaison), arrêts 0 / 0.55 / 1. */
export function surfaceLinear(top: string, mid: string, bottom: string): SkinLinear {
  return {
    x1: 0,
    y1: 0,
    x2: 0.2,
    y2: 1,
    stops: [
      { color: top, offset: 0 },
      { color: mid, offset: 0.55 },
      { color: bottom, offset: 1 },
    ],
  };
}

/** Géométrie de référence des motifs (fractions de la largeur, base 300 px). */
const STRIPE_GEOMETRY: Record<SkinStripePattern, Pick<SkinStripes, 'spacing' | 'width' | 'slope'>> =
  {
    diagonal: { spacing: 16 / 300, width: 2 / 300, slope: 0.7 },
    chevron: { spacing: 38 / 300, width: 2 / 300, slope: 1 },
    scanline: { spacing: 6 / 300, width: 1 / 300, slope: 0 },
  };

/** Rayures d'un motif donné, avec la géométrie de référence de la marque. */
export function stripes(
  pattern: SkinStripePattern,
  color: string,
  opacity: number,
  extra?: { color2?: string; opacity2?: number },
): SkinStripes {
  const g = STRIPE_GEOMETRY[pattern];
  return {
    pattern,
    color,
    opacity,
    spacing: g.spacing,
    width: g.width,
    slope: g.slope,
    ...(extra?.color2 ? { color2: extra.color2, opacity2: extra.opacity2 ?? opacity } : {}),
  };
}

/** Foil premium — réglages de référence (mesurés sur la carte de 300 px). */
export function sheen(color: string, opacity = 0.16): SkinSheen {
  return { color, opacity, width: 0.36, skewDeg: -18, travelMs: 1700, holdMs: 1400 };
}

/** Halo qui respire — période de référence. */
export function glow(color: string, periodMs = 3200): SkinGlow {
  return { color, periodMs };
}

/* ========================================================================== */
/* Skins livrés avec l'application                                            */
/* ========================================================================== */

/** Clés des skins intégrés. Les skins de la boutique en ajoutent d'autres. */
export const BUILTIN_SKIN_KEYS = [
  'gold',
  'signature',
  'emerald',
  'champion',
  'global',
  'indomptable',
  'heritage237',
  'nuit-douala',
] as const;
export type BuiltinSkinKey = (typeof BUILTIN_SKIN_KEYS)[number];

/** Skin par défaut d'une carte de jeu. */
export const DEFAULT_SKIN_KEY: BuiltinSkinKey = 'signature';
/** Skin par défaut de la carte globale (identité tous jeux). */
export const GLOBAL_SKIN_KEY: BuiltinSkinKey = 'global';

function spec(s: Omit<SkinSpec, 'version'>): SkinSpec {
  return { version: SKIN_SPEC_VERSION, ...s };
}

/**
 * Les 8 skins intégrés — DÉFINIS ICI ET NULLE PART AILLEURS.
 * Toute retouche de palette se fait dans ce seul objet : web et natif suivent.
 */
export const BUILTIN_SKINS: Record<BuiltinSkinKey, SkinSpec> = {
  /* Or — le skin « brut » historique. */
  gold: spec({
    key: 'gold',
    label: 'Or',
    premium: false,
    ink: '#241702',
    line: 'rgba(36,23,2,0.22)',
    accent: '#8a5a12',
    frame: frameLinear('#fff0a8', '#c89119', '#4a3608'),
    surface: surfaceLinear('#e9bc3f', '#c89a28', '#6f5a1c'),
    radials: [{ color: '#fff0a8', opacity: 0.9, cx: 0.72, cy: 0.18, r: 0.6 }],
    border: '#a5810a',
    inner: 'rgba(255,255,255,0.3)',
  }),

  /* Signature — vert du hub (et vert FC 27) : défaut des cartes de jeu. */
  signature: spec({
    key: 'signature',
    label: 'Signature',
    premium: false,
    ink: '#eafff3',
    line: 'rgba(255,255,255,0.16)',
    accent: '#4ade80',
    frame: frameLinear('#b9f7d0', '#1d9e58', '#052716'),
    surface: surfaceLinear('#0e4f2c', '#0a3d22', '#052a16'),
    radials: [{ color: '#4ade80', opacity: 0.32, cx: 0.72, cy: 0.18, r: 0.7 }],
    border: 'rgba(74,222,128,0.5)',
    inner: 'rgba(255,255,255,0.2)',
  }),

  /* Émeraude — variante vert profond. */
  emerald: spec({
    key: 'emerald',
    label: 'Émeraude',
    premium: false,
    ink: '#eafff3',
    line: 'rgba(255,255,255,0.16)',
    accent: '#4ade80',
    frame: frameLinear('#a9f0c8', '#16794a', '#06301d'),
    surface: surfaceLinear('#0f5f3c', '#0a4a2e', '#062d1c'),
    radials: [{ color: '#4ade80', opacity: 0.3, cx: 0.5, cy: -0.1, r: 0.85 }],
    border: 'rgba(74,222,128,0.5)',
    inner: 'rgba(255,255,255,0.18)',
  }),

  /* Champion — n°1 du classement : nuit charbon + rayons d'or. */
  champion: spec({
    key: 'champion',
    label: 'Champion',
    premium: false,
    ink: '#f8f2df',
    line: 'rgba(244,204,101,0.25)',
    accent: '#ffd970',
    frame: frameLinear('#fff0ad', '#f4cc65', '#5a3a0a'),
    surface: surfaceLinear('#2b1c04', '#140c02', '#241503'),
    radials: [
      { color: '#ffcc5c', opacity: 0.5, cx: 0.68, cy: 0.04, r: 0.62 },
      { color: '#ffb020', opacity: 0.18, cx: 0.22, cy: 0.3, r: 0.6 },
    ],
    stripes: stripes('diagonal', '#f4cc65', 0.07),
    border: '#ffd970',
    inner: 'rgba(255,255,255,0.28)',
    sheen: sheen('#ffe08a', 0.2),
    glow: glow('rgba(255,200,60,0.55)'),
  }),

  /* Globale — identité tous jeux : bleu nuit + or prestige. */
  global: spec({
    key: 'global',
    label: 'Globale',
    premium: false,
    ink: '#fff7e6',
    line: 'rgba(255,255,255,0.16)',
    accent: '#fde68a',
    frame: frameLinear('#ffe9a0', '#b58a2b', '#4a3608'),
    surface: surfaceLinear('#1b2c4d', '#0c1930', '#0a1424'),
    radials: [
      { color: '#facc15', opacity: 0.3, cx: 0.78, cy: -0.06, r: 0.75 },
      { color: '#22d3ee', opacity: 0.22, cx: 0.12, cy: 1.12, r: 0.65 },
    ],
    border: 'rgba(250,204,21,0.6)',
    inner: 'rgba(250,204,21,0.4)',
  }),

  /* --- Skins PREMIUM vendables ------------------------------------------- */

  /* Indomptable — or profond, braise diagonale. */
  indomptable: spec({
    key: 'indomptable',
    label: 'Indomptable',
    premium: true,
    ink: '#f7ecca',
    line: 'rgba(240,205,110,0.22)',
    accent: '#f0cd6e',
    frame: frameLinear('#f0cd6e', '#8a6a1f', '#241905'),
    surface: surfaceLinear('#241905', '#150e03', '#2b1f08'),
    radials: [{ color: '#3b2a0a', opacity: 1, cx: 0.5, cy: -0.1, r: 0.9 }],
    stripes: stripes('diagonal', '#f0cd6e', 0.05),
    border: 'rgba(240,205,110,0.55)',
    inner: 'rgba(240,205,110,0.38)',
    sheen: sheen('#f0cd6e'),
    glow: glow('rgba(240,205,110,0.4)'),
  }),

  /* 237 Héritage — vert forêt, chevrons toghu jaune/rouge. */
  heritage237: spec({
    key: 'heritage237',
    label: '237 Héritage',
    premium: true,
    ink: '#eef7e9',
    line: 'rgba(252,209,22,0.22)',
    accent: '#fcd116',
    frame: frameLinear('#fcd116', '#007a5e', '#032218'),
    surface: surfaceLinear('#0b2e1b', '#071f12', '#0e3520'),
    radials: [{ color: '#123b24', opacity: 1, cx: 0.5, cy: 1.1, r: 0.9 }],
    stripes: stripes('chevron', '#fcd116', 0.055, { color2: '#ce1126', opacity2: 0.05 }),
    border: 'rgba(252,209,22,0.55)',
    inner: 'rgba(252,209,22,0.32)',
    sheen: sheen('#fcd116'),
    glow: glow('rgba(0,122,94,0.55)'),
  }),

  /* Nuit de Douala — bleu nuit, scanlines cyan, touche magenta. */
  'nuit-douala': spec({
    key: 'nuit-douala',
    label: 'Nuit de Douala',
    premium: true,
    ink: '#e4f6ff',
    line: 'rgba(53,225,225,0.25)',
    accent: '#35e1e1',
    frame: frameLinear('#7fe8f5', '#1b6ea8', '#071226'),
    surface: surfaceLinear('#071226', '#050b18', '#0b1e33'),
    radials: [{ color: '#c13bff', opacity: 0.16, cx: 0.85, cy: -0.1, r: 0.7 }],
    stripes: stripes('scanline', '#35e1e1', 0.045),
    border: 'rgba(53,225,225,0.55)',
    inner: 'rgba(53,225,225,0.3)',
    sheen: sheen('#35e1e1'),
    glow: glow('rgba(53,225,225,0.42)'),
  }),
};

/** Vrai si la clé désigne un skin intégré. */
export function isBuiltinSkinKey(key: string): key is BuiltinSkinKey {
  return (BUILTIN_SKIN_KEYS as readonly string[]).includes(key);
}

/* ========================================================================== */
/* Création assistée (dashboard admin)                                        */
/* ========================================================================== */

/**
 * Palette minimale saisie par l'admin : 6 couleurs suffisent à composer un skin
 * complet. Tout le reste est dérivé, ce qui garantit un rendu cohérent même
 * pour un skin inventé en deux minutes.
 */
export interface SkinSeed {
  key: string;
  label: string;
  premium?: boolean;
  /** Fond principal (haut du dégradé de surface). */
  background: string;
  /** Couleur du cadre (milieu du liseré). */
  frame: string;
  /** Bas du cadre — dérivé si absent. */
  frameDark?: string;
  /** Halo radial du haut. */
  halo?: string;
  /** Encre du texte — dérivée du fond si absente. */
  ink?: string;
  accent?: string;
  stripes?: SkinStripePattern | null;
  sheenColor?: string;
  glowColor?: string;
}

/**
 * Développe une palette minimale en `SkinSpec` complet.
 * Utilisé par l'éditeur de skins (aperçu en direct) ET par l'API (normalisation
 * avant écriture) → l'aperçu du dashboard est exactement ce que verra le mobile.
 */
export function skinFromSeed(seedInput: SkinSeed): SkinSpec {
  const seed = seedInput;
  const frameDark = seed.frameDark ?? darken(seed.frame, 0.62);
  const frameHi = lighten(seed.frame, 0.55);
  const halo = seed.halo ?? frameHi;
  const ink = seed.ink ?? readableInk(seed.background);
  const accent = seed.accent ?? frameHi;
  const premium = seed.premium ?? false;

  return spec({
    key: seed.key,
    label: seed.label,
    premium,
    ink,
    line: withAlpha(ink, 0.2),
    accent,
    frame: frameLinear(frameHi, seed.frame, frameDark),
    surface: surfaceLinear(
      seed.background,
      darken(seed.background, 0.22),
      darken(seed.background, 0.48),
    ),
    radials: [{ color: halo, opacity: 0.32, cx: 0.72, cy: 0.18, r: 0.7 }],
    stripes: seed.stripes ? stripes(seed.stripes, accent, 0.06) : undefined,
    border: withAlpha(accent, 0.55),
    inner: withAlpha(frameHi, 0.32),
    sheen: premium ? sheen(seed.sheenColor ?? frameHi) : undefined,
    glow: premium ? glow(withAlpha(seed.glowColor ?? accent, 0.45)) : undefined,
  });
}

/** Palette minimale correspondant à un spec — pour ré-ouvrir un skin à l'édition. */
export function seedFromSkin(s: SkinSpec): SkinSeed {
  const frameStops = s.frame.stops;
  const surfaceStops = s.surface.stops;
  return {
    key: s.key,
    label: s.label,
    premium: s.premium,
    background: surfaceStops[0]?.color ?? '#12294a',
    frame: frameStops[1]?.color ?? '#1b3a63',
    frameDark: frameStops[frameStops.length - 1]?.color,
    halo: s.radials[0]?.color,
    ink: s.ink,
    accent: s.accent,
    stripes: s.stripes?.pattern ?? null,
    sheenColor: s.sheen?.color,
    glowColor: s.glow?.color,
  };
}

/* ========================================================================== */
/* Lecture tolérante (base de données, API, anciens formats)                   */
/* ========================================================================== */

const LEGACY_VAR_KEYS = [
  '--pc-ink',
  '--pc-frame1',
  '--pc-frame2',
  '--pc-bg1',
  '--pc-bg2',
  '--pc-accent',
  '--pc-sheenc',
  '--pc-glowc',
] as const;

/** Vrai si l'objet est un ancien `design` = dictionnaire de variables CSS. */
export function isLegacyDesign(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const keys = Object.keys(value as Record<string, unknown>);
  return keys.some((k) => (LEGACY_VAR_KEYS as readonly string[]).includes(k));
}

/**
 * Migre un ancien `design` (`{"--pc-bg2": "#…", premium: true}`) vers un spec.
 * Les skins créés avant l'unification restent donc affichables — et deviennent
 * du même coup rendus sur mobile.
 */
export function skinFromLegacyDesign(
  design: Record<string, unknown>,
  key: string,
  label = key,
): SkinSpec {
  const get = (name: string): string | undefined => {
    const v = design[name];
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  };
  const background = get('--pc-bg2') ?? '#12294a';
  const frame = get('--pc-frame1') ?? '#1b3a63';
  return skinFromSeed({
    key,
    label,
    premium: design.premium === true,
    background,
    frame,
    frameDark: get('--pc-frame2'),
    halo: get('--pc-bg1'),
    ink: get('--pc-ink'),
    accent: get('--pc-accent'),
    sheenColor: get('--pc-sheenc'),
    glowColor: get('--pc-glowc'),
  });
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function parseStops(v: unknown, fallback: SkinStop[]): SkinStop[] {
  if (!Array.isArray(v) || v.length < 2) return fallback;
  const out: SkinStop[] = [];
  v.forEach((raw, i) => {
    if (!raw || typeof raw !== 'object') return;
    const o = raw as Record<string, unknown>;
    const color = str(o.color, '');
    if (!color) return;
    out.push({ color, offset: num(o.offset, i / Math.max(1, v.length - 1)) });
  });
  return out.length >= 2 ? out : fallback;
}

function parseLinear(v: unknown, fallback: SkinLinear): SkinLinear {
  if (!v || typeof v !== 'object') return fallback;
  const o = v as Record<string, unknown>;
  return {
    x1: num(o.x1, fallback.x1),
    y1: num(o.y1, fallback.y1),
    x2: num(o.x2, fallback.x2),
    y2: num(o.y2, fallback.y2),
    stops: parseStops(o.stops, fallback.stops),
  };
}

function parseRadials(v: unknown): SkinRadial[] {
  if (!Array.isArray(v)) return [];
  const out: SkinRadial[] = [];
  for (const raw of v.slice(0, 4)) {
    if (!raw || typeof raw !== 'object') continue;
    const o = raw as Record<string, unknown>;
    const color = str(o.color, '');
    if (!color) continue;
    out.push({
      color,
      opacity: num(o.opacity, 0.3),
      cx: num(o.cx, 0.5),
      cy: num(o.cy, 0.2),
      r: num(o.r, 0.7),
    });
  }
  return out;
}

function parseStripes(v: unknown): SkinStripes | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const pattern = str(o.pattern, '') as SkinStripePattern;
  if (!(SKIN_STRIPE_PATTERNS as readonly string[]).includes(pattern)) return undefined;
  const color = str(o.color, '');
  if (!color) return undefined;
  const base = STRIPE_GEOMETRY[pattern];
  const color2 = str(o.color2, '');
  /* Ordre des clés aligné sur `stripes()` : une relecture depuis la base
     resérialise à l'identique, donc pas de faux diff jsonb. */
  return {
    pattern,
    color,
    opacity: num(o.opacity, 0.06),
    spacing: Math.max(0.004, num(o.spacing, base.spacing)),
    width: Math.max(0.001, num(o.width, base.width)),
    slope: num(o.slope, base.slope),
    ...(color2 ? { color2, opacity2: num(o.opacity2, num(o.opacity, 0.06)) } : {}),
  };
}

function parseSheen(v: unknown): SkinSheen | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const color = str(o.color, '');
  if (!color) return undefined;
  const ref = sheen(color);
  return {
    color,
    opacity: num(o.opacity, ref.opacity),
    width: num(o.width, ref.width),
    skewDeg: num(o.skewDeg, ref.skewDeg),
    travelMs: num(o.travelMs, ref.travelMs),
    holdMs: num(o.holdMs, ref.holdMs),
  };
}

function parseGlow(v: unknown): SkinGlow | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const color = str(o.color, '');
  if (!color) return undefined;
  return { color, periodMs: num(o.periodMs, 3200) };
}

/**
 * Lit n'importe quelle valeur venue de la base / de l'API et rend un
 * `SkinSpec` COMPLET. Ne jette jamais : un design corrompu retombe sur le skin
 * par défaut. C'est ce qui évite l'écran blanc sur mobile quand un admin
 * enregistre un JSON invalide.
 *
 * Accepte : un `SkinSpec`, un ancien dictionnaire `--pc-*`, une clé de skin
 * intégré, `null`/`undefined`.
 */
export function parseSkinSpec(
  value: unknown,
  opts: { key?: string; label?: string; fallback?: SkinSpec } = {},
): SkinSpec {
  const fallback = opts.fallback ?? BUILTIN_SKINS[DEFAULT_SKIN_KEY];

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (isBuiltinSkinKey(trimmed)) return BUILTIN_SKINS[trimmed];
    return fallback;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const o = value as Record<string, unknown>;
  const key = str(o.key, opts.key ?? fallback.key);

  if (isLegacyDesign(o)) return skinFromLegacyDesign(o, key, opts.label ?? key);

  /* Un objet sans dégradé exploitable n'est pas un spec : on garde le repli. */
  if (!o.frame && !o.surface) {
    return isBuiltinSkinKey(key) ? BUILTIN_SKINS[key] : fallback;
  }

  const ink = str(o.ink, fallback.ink);
  return {
    version: num(o.version, SKIN_SPEC_VERSION),
    key,
    label: str(o.label, opts.label ?? key),
    premium: o.premium === true,
    ink,
    line: str(o.line, withAlpha(ink, 0.2)),
    accent: str(o.accent, fallback.accent),
    frame: parseLinear(o.frame, fallback.frame),
    surface: parseLinear(o.surface, fallback.surface),
    radials: parseRadials(o.radials),
    stripes: parseStripes(o.stripes),
    border: str(o.border, fallback.border),
    inner: str(o.inner, fallback.inner),
    sheen: parseSheen(o.sheen),
    glow: parseGlow(o.glow),
  };
}

/**
 * Résout une clé de skin en spec, en consultant d'abord le catalogue dynamique
 * (skins boutique chargés depuis l'API) puis les skins intégrés.
 * Une clé inconnue ne casse RIEN : on retombe sur le défaut.
 */
export function resolveSkin(
  key: string | null | undefined,
  catalog?: Readonly<Record<string, SkinSpec>> | null,
  fallbackKey: BuiltinSkinKey = DEFAULT_SKIN_KEY,
): SkinSpec {
  if (key) {
    const k = key.trim();
    const dynamic = catalog?.[k];
    if (dynamic) return dynamic;
    if (isBuiltinSkinKey(k)) return BUILTIN_SKINS[k];
  }
  return BUILTIN_SKINS[fallbackKey];
}
