/**
 * Tokens de design ESPORT 237 HUB.
 *
 * Source de vérité unique, sans dépendance : consommable par le web (variables
 * CSS via theme.css), React Native (StyleSheet), Tailwind, Astro.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LE SYSTÈME EN QUATRE COUCHES
 * ─────────────────────────────────────────────────────────────────────────
 * 1. FONDATION NEUTRE — quatre fonds, deux traits, quatre niveaux de texte.
 *    C'est 90 % de l'écran. Tout le reste se pose dessus.
 * 2. ACCENT FONCTIONNEL — les rampes 50→950 de la marque (lime + cyan). On
 *    ne « choisit pas une couleur », on choisit un ÉCHELON dans une rampe.
 * 3. SÉMANTIQUE — succès / danger / alerte / info / or, plus le spectre des
 *    graphiques. Ces couleurs veulent dire quelque chose : elles ont le droit
 *    de sortir du système, et le devoir de rester lisibles.
 * 4. MISE EN THÈME — `tintNeutral()` recolore toute la fondation d'un coup.
 *
 * Toutes les valeurs sont générées en OKLCH (voir `./oklch.ts`) puis figées en
 * hexadécimal ici : les applications lisent des constantes, pas un calcul.
 * Les écarts de clarté sont choisis, pas devinés :
 *
 *   • en CLAIR, ~0.025 de clarté OKLCH entre deux fonds ;
 *   • en SOMBRE, ~0.046 — soit le DOUBLE.
 *
 * C'est la règle la moins intuitive du lot, et celle qui fait tout : deux tons
 * sombres se ressemblent beaucoup plus que deux tons clairs séparés d'autant.
 * Refléter bêtement la palette claire en sombre écrase toute la hiérarchie —
 * les cartes disparaissent dans la page.
 *
 * Chaque couple texte × fond de ce fichier tient le AA (4.5:1), vérifié par
 * `contrast.test.ts`. Ne pas modifier une valeur sans relancer ce test.
 */

export {
  buildRamp,
  buildSpectrum,
  contrast,
  hexToOklch,
  luminance,
  oklchToHex,
  tintNeutral,
  RAMP_STEPS,
  type Oklch,
  type Ramp,
  type RampStep,
} from './oklch';

/* ═══════════════════════════════════════════════════════════════════════ */
/* COUCHE 2 & 3 — LES RAMPES                                               */
/* ═══════════════════════════════════════════════════════════════════════ */

/**
 * Rampes complètes. On n'utilise JAMAIS une rampe au hasard : chaque mode a
 * ses échelons de service, listés dans `ROLE` plus bas.
 *
 * Générées par `buildRamp()` à teinte constante — d'où la parenté évidente
 * entre les onze tons d'une même rampe.
 */
export const ramp = {
  /** Vert lime du logo — accent principal, actions. */
  accent: {
    50: '#e7fedd',
    100: '#d3f7c2',
    200: '#b7eb9c',
    300: '#96db70',
    400: '#78c746',
    500: '#5fb21f',
    600: '#479900',
    700: '#2f7700',
    800: '#296300',
    900: '#204f00',
    950: '#123100',
  },
  /** Bleu électrique du logo — accent secondaire, libellés de section, liens. */
  cyan: {
    50: '#dcfcff',
    100: '#bff5ff',
    200: '#96e9f9',
    300: '#60d8ee',
    400: '#15c3dd',
    500: '#00aec9',
    600: '#0096b0',
    700: '#00748b',
    800: '#006173',
    900: '#004d5c',
    950: '#002f39',
  },
  /**
   * Succès — émeraude (teinte 166), volontairement ÉLOIGNÉE du lime de
   * l'accent (teinte 136). La marque étant verte, un « validé » vert lime
   * serait indistinguable d'un bouton : 30° d'écart de teinte, plus la règle
   * « l'accent ne sert jamais à dire un état », suffisent à les séparer.
   */
  success: {
    50: '#e0fef0',
    100: '#c6f8e2',
    200: '#a1eccc',
    300: '#74ddb4',
    400: '#45c99b',
    500: '#0db485',
    600: '#009b6e',
    700: '#007952',
    800: '#006545',
    900: '#005037',
    950: '#003120',
  },
  /** Danger — rouge. Une action destructrice n'est jamais d'une autre couleur. */
  danger: {
    50: '#ffebe7',
    100: '#ffd9d3',
    200: '#ffbfb7',
    300: '#ffa098',
    400: '#ff837b',
    500: '#ee6a64',
    600: '#d3514d',
    700: '#a73735',
    800: '#8b302e',
    900: '#6f2523',
    950: '#461514',
  },
  /** Alerte — ambre : en attente, litige, action requise. */
  warning: {
    50: '#fff2da',
    100: '#ffe4bd',
    200: '#ffcf95',
    300: '#f8b667',
    400: '#e79d38',
    500: '#d38600',
    600: '#b96e00',
    700: '#925100',
    800: '#7a4500',
    900: '#613600',
    950: '#3d2000',
  },
  /** Information — bleu neutre, distinct du cyan de marque. */
  info: {
    50: '#e4f8ff',
    100: '#cfeeff',
    200: '#b0deff',
    300: '#8dc9ff',
    400: '#6cb3ff',
    500: '#539ded',
    600: '#3a85d3',
    700: '#2265a8',
    800: '#1f558c',
    900: '#184370',
    950: '#0c2946',
  },
  /** Or — podiums, division Elite. Décoratif, jamais un état. */
  gold: {
    50: '#fdf6da',
    100: '#f7ebbd',
    200: '#ecd995',
    300: '#ddc465',
    400: '#caad34',
    500: '#b69700',
    600: '#9d7f00',
    700: '#7b6000',
    800: '#665100',
    900: '#514000',
    950: '#322700',
  },
} as const;

export type RampName = keyof typeof ramp;

/**
 * Échelon de service par mode — la table à consulter avant d'écrire une
 * couleur en dur.
 *
 * En CLAIR le fond est blanc : il faut descendre au 700 pour tenir le AA en
 * texte (le 600 plafonne à 3.6:1). En SOMBRE le fond est sombre : le 400 est
 * le bon compromis lisibilité / éclat, et le 300 sert au survol.
 *
 * `onFill` est la couleur d'étiquette posée SUR un fond plein de la rampe.
 */
export const ROLE = {
  light: {
    /** Texte, icône, lien, bordure active. */
    text: 700,
    /** Fond plein d'un bouton ou d'une pastille pleine. */
    fill: 700,
    /** Survol d'un fond plein — plus sombre : le bouton « s'enfonce ». */
    fillHover: 800,
    /** Fond teinté d'une pastille discrète. */
    tint: 50,
    /** Liseré d'une pastille discrète. */
    tintBorder: 200,
    /** Étiquette posée sur `fill`. */
    onFill: '#ffffff',
  },
  dark: {
    text: 400,
    fill: 400,
    /** Survol : on descend d'un cran, le bouton se densifie sans ternir. */
    fillHover: 500,
    tint: 950,
    tintBorder: 800,
    onFill: '#0b1403',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════ */
/* COUCHE 1 — LA FONDATION NEUTRE                                          */
/* ═══════════════════════════════════════════════════════════════════════ */

export interface ColorScale {
  /* — Les quatre fonds, du plus reculé au plus élevé — */

  /** 1/4 · Fond de page : la toile sur laquelle tout est posé. */
  bg: string;
  /**
   * 2/4 · Cadre de l'application : barre latérale, en-tête, pied.
   *
   * En CLAIR il est plus SOMBRE que la page — c'est l'ancre qui tient
   * l'écran, à la manière de la barre latérale de Mercury. En SOMBRE il est
   * plus CLAIR que la page : en mode sombre une surface qui s'élève
   * s'éclaircit, toujours, sans exception.
   */
  frame: string;
  /** 3/4 · Cartes et panneaux — en clair, le blanc pur qui détache. */
  surface: string;
  /** 4/4 · Modales, menus, popovers, survols de ligne. */
  surfaceRaised: string;

  /* — Les deux traits — */

  /**
   * Trait discret : le contour d'une carte. ~90 % de blanc en clair.
   * Surtout PAS un noir fin — il découpe la carte au lieu de la poser.
   */
  border: string;
  /** Trait affirmé : champs de saisie, séparateurs qui doivent se lire. */
  borderStrong: string;

  /* — Les quatre niveaux de texte — */

  /** Titres importants. Le plus sombre du système — jamais du noir pur. */
  textStrong: string;
  /** Corps de texte : l'essentiel de ce qui se lit. */
  textPrimary: string;
  /** Texte secondaire : sous-titres, métadonnées lisibles. */
  textSecondary: string;
  /** Texte atténué : indications, horodatages, texte d'invite. */
  textMuted: string;

  /* — Couche 2 : accents, échelon de service déjà résolu pour le mode — */

  /** Accent principal (vert duel) — CTA, éléments actifs. */
  accent: string;
  /** Accent au survol. */
  accentHover: string;
  /** Fond teinté d'accent (pastilles, lignes actives). */
  accentSubtle: string;
  /** Liseré teinté d'accent. */
  accentBorder: string;
  /** Variante claire de l'accent — dégradés, lueurs. */
  accentBright: string;
  /** Texte posé sur un aplat d'accent. */
  onAccent: string;
  /** Accent secondaire — libellés de section, liens. */
  cyan: string;

  /* — Couche 3 : sémantique — */

  /** Validé, gagné. */
  success: string;
  /** Défaite, contestation, action destructrice. */
  danger: string;
  /** En attente, litige. */
  warning: string;
  /** Information neutre. */
  info: string;
  /** Podiums, division Elite. */
  gold: string;
}

const L = ROLE.light;
const D = ROLE.dark;

export const color: { light: ColorScale; dark: ColorScale } = {
  /**
   * CLAIR — écarts de ~0.025 de clarté OKLCH entre fonds.
   * Le cadre est plus sombre que la page, les cartes sont blanc pur : c'est
   * ce qui les fait « décoller » sans avoir besoin d'une ombre portée.
   */
  light: {
    bg: '#f4f6f9',
    frame: '#ebeef2',
    surface: '#ffffff',
    surfaceRaised: '#ffffff',
    border: '#dee2e7',
    borderStrong: '#ccd1d8',
    textStrong: '#171f28',
    textPrimary: '#2b343f',
    textSecondary: '#515c6a',
    textMuted: '#636d7a',
    accent: ramp.accent[L.fill],
    accentHover: ramp.accent[L.fillHover],
    accentSubtle: ramp.accent[L.tint],
    accentBorder: ramp.accent[L.tintBorder],
    accentBright: ramp.accent[500],
    onAccent: L.onFill,
    cyan: ramp.cyan[L.text],
    success: ramp.success[L.text],
    danger: ramp.danger[L.text],
    warning: ramp.warning[L.text],
    info: ramp.info[L.text],
    gold: ramp.gold[L.text],
  },
  /**
   * SOMBRE — écarts de ~0.046, soit le double du mode clair.
   * L'ordre bg < frame < surface < raised n'est pas négociable : en sombre,
   * une surface plus élevée est toujours plus claire.
   */
  dark: {
    bg: '#0e1116',
    frame: '#171c21',
    surface: '#21262d',
    surfaceRaised: '#2c323a',
    border: '#353c45',
    borderStrong: '#4a525e',
    textStrong: '#f4f7fb',
    textPrimary: '#e2e7ec',
    textSecondary: '#b2bbc9',
    textMuted: '#949faf',
    accent: ramp.accent[D.fill],
    accentHover: ramp.accent[D.fillHover],
    accentSubtle: ramp.accent[D.tint],
    accentBorder: ramp.accent[D.tintBorder],
    accentBright: ramp.accent[300],
    onAccent: D.onFill,
    cyan: ramp.cyan[D.text],
    success: ramp.success[D.text],
    danger: ramp.danger[D.text],
    warning: ramp.warning[D.text],
    info: ramp.info[D.text],
    gold: ramp.gold[D.text],
  },
};

/* ═══════════════════════════════════════════════════════════════════════ */
/* COUCHE 3 — LE SPECTRE DES GRAPHIQUES                                    */
/* ═══════════════════════════════════════════════════════════════════════ */

/**
 * Huit séries, même clarté et même chroma perçus, teinte incrémentée de 42°.
 *
 * Un graphique en nuances de gris est illisible ; un graphique dans la seule
 * rampe de marque l'est presque autant — toutes les séries se ressemblent.
 * Il faut un vrai spectre. Mais un spectre naïf trahit : un vert vif paraît
 * bien plus lumineux qu'un bleu vif à « valeur » égale, et l'œil croit lire
 * une hiérarchie qui n'existe pas. En OKLCH, à L et C constants, les huit
 * teintes pèsent exactement le même poids.
 *
 * Ordre choisi pour que deux séries voisines ne se confondent jamais, et
 * pour que la première soit dans la famille verte de la marque.
 */
export const chart: { light: string[]; dark: string[] } = {
  light: [
    '#4e9a52', // vert
    '#009e93', // sarcelle
    '#0093c4', // bleu
    '#6a80d4', // indigo
    '#a16dbd', // violet
    '#c1628a', // rose
    '#c7674b', // brique
    '#b07b00', // ocre
  ],
  dark: [
    '#7ac67d',
    '#20cbbf',
    '#44c0f2',
    '#93acff',
    '#cd98eb',
    '#f08db5',
    '#f69376',
    '#dca747',
  ],
};

/* ═══════════════════════════════════════════════════════════════════════ */
/* HORS COULEUR                                                            */
/* ═══════════════════════════════════════════════════════════════════════ */

/** Échelle d'espacement en pixels (clé = multiplicateur de 4). */
export const spacing = {
  '0': 0,
  '1': 4,
  '1-5': 6,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
} as const;

/** Rayons de bordure (cartes arrondies des maquettes). */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const font = {
  family: {
    /** Corps — Chivo (web + mobile). */
    body: "'Chivo', ui-sans-serif, system-ui, sans-serif",
    /** Titres / marque — Space Grotesk. */
    heading: "'Space Grotesk', 'Chivo', ui-sans-serif, system-ui, sans-serif",
    display: "'Space Grotesk', 'Chivo', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, 'Cascadia Code', Consolas, monospace",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export type ThemeMode = 'light' | 'dark';

/**
 * Applique un canal alpha à une couleur hexadécimale (`#RGB` ou `#RRGGBB`).
 * Renvoie une chaîne `rgba(…)` comprise par le web ET React Native — c'est
 * l'équivalent natif du `color-mix(in srgb, … %, transparent)` des feuilles
 * CSS. Toute autre notation (rgb(), nom CSS, dégradé) est renvoyée telle
 * quelle : on ne fabrique jamais une couleur qui n'est pas dans les tokens.
 */
export function withAlpha(input: string, alpha: number): string {
  const a = Math.min(1, Math.max(0, alpha));
  const hex = input.trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
  const long = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  const channels = short
    ? short.slice(1).map((d) => Number.parseInt(`${d}${d}`, 16))
    : long
      ? long.slice(1).map((d) => Number.parseInt(d, 16))
      : null;
  if (!channels) return hex;
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${a})`;
}

/**
 * Opacités des pilules (badges, puces, onglets) côté NATIF.
 *
 * Le web pose ses `.e237-badge` / `.chip` sur une page nette, avec un liseré
 * `--e237-border` et un fond `--e237-surface` : la forme se lit toujours.
 * Sur téléphone un simple voile à 14 % disparaît — d'où un fond plus appuyé
 * ET un liseré de la même teinte qui dessine la pilule. Valeurs partagées par
 * tous les composants natifs pour rester cohérents d'un écran à l'autre.
 *
 * Dosage : en CLAIR on reste au niveau du web (16 %) — au-delà, le fond
 * remonte et le texte teinté perd du contraste — et c'est le liseré, plus
 * marqué, qui fait le travail de lisibilité. En SOMBRE le fond peut monter à
 * 26 % : le texte accent conserve ~4,8:1 sur la surface (AA) tout en rendant
 * la pilule franchement visible en plein jour.
 */
export const pill: {
  /** Opacité du fond teinté d'une pilule active/tonale. */
  fill: Record<ThemeMode, number>;
  /** Opacité du liseré de la même teinte. */
  stroke: Record<ThemeMode, number>;
} = {
  fill: { light: 0.16, dark: 0.26 },
  stroke: { light: 0.55, dark: 0.45 },
};

/** Regroupement pratique pour un accès unique. */
export const tokens = {
  color,
  ramp,
  chart,
  spacing,
  radius,
  font,
  pill,
  ROLE,
} as const;

export default tokens;
