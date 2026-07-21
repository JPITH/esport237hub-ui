/**
 * Tokens de design ESPORT 237 HUB.
 *
 * Source de vérité unique, sans dépendance : consommable par le web (CSS
 * variables via theme.css), React Native (StyleSheet), Tailwind, Astro.
 * Palette extraite des maquettes V1 (univers sombre, accents vert/cyan).
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
    bg: '#0B0F14',
    surface: '#111826',
    surfaceRaised: '#1A2332',
    border: '#1F2A37',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#22C55E',
    accentBright: '#4ADE80',
    onAccent: '#04120A',
    cyan: '#22D3EE',
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
    textMuted: '#94A3B8',
    accent: '#16A34A',
    accentBright: '#22C55E',
    onAccent: '#FFFFFF',
    cyan: '#0891B2',
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
    body: "'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    heading: "'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
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

/** Regroupement pratique pour un accès unique. */
export const tokens = { color, spacing, radius, font } as const;

export default tokens;
