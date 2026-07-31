/**
 * Tokens de design ESPORT 237 HUB.
 *
 * Source de vérité unique, sans dépendance : consommable par le web (CSS
 * variables via theme.css), React Native (StyleSheet), Tailwind, Astro.
 * Palette alignée sur le logo ESPORT 237 (vert lime + bleu électrique).
 */

export interface ColorScale {
  /** Fond de page. */
  bg: string;
  /** Fond des cartes et surfaces. */
  surface: string;
  /** Surface surélevée (modales, menus). */
  surfaceRaised: string;
  /** Bordures et séparateurs. */
  border: string;
  /** Texte principal. */
  textPrimary: string;
  /** Texte secondaire. */
  textSecondary: string;
  /** Texte atténué (placeholders, métadonnées). */
  textMuted: string;
  /** Accent principal — vert « duel » (CTA). */
  accent: string;
  /** Variante claire de l'accent (hover, gradients). */
  accentBright: string;
  /** Texte posé sur l'accent. */
  onAccent: string;
  /** Accent secondaire — cyan (labels de section, liens). */
  cyan: string;
  /** Succès (victoire, validé). */
  success: string;
  /** Danger (défaite, contestation). */
  danger: string;
  /** Avertissement (en attente, litige). */
  warning: string;
  /** Or (podiums, badges élite). */
  gold: string;
}

export const color: { light: ColorScale; dark: ColorScale } = {
  dark: {
    bg: '#07080E',
    surface: '#14141C',
    surfaceRaised: '#1C1C26',
    border: '#2A2A36',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#94A3B8',
    /** Vert lime logo. */
    accent: '#7CE032',
    accentBright: '#9AF050',
    onAccent: '#04120A',
    /** Bleu électrique logo. */
    cyan: '#00D4F0',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    gold: '#FACC15',
  },
  light: {
    bg: '#F7F9FB',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    /** Vert logo assombri pour contraste AA sur fond clair. */
    accent: '#3F9A14',
    accentBright: '#4CA820',
    onAccent: '#FFFFFF',
    /** Bleu logo assombri pour contraste AA. */
    cyan: '#0088A8',
    success: '#059669',
    danger: '#DC2626',
    warning: '#D97706',
    gold: '#CA8A04',
  },
};

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
export const tokens = { color, spacing, radius, font, pill } as const;

export default tokens;
