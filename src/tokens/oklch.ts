/**
 * Conversion OKLCH ⇄ sRGB, sans dépendance.
 *
 * Pourquoi OKLCH et pas HSL : en HSL, deux couleurs de même « lightness » ne
 * sont PAS perçues aussi claires l'une que l'autre — un vert à 50 % éclate,
 * un bleu à 50 % s'éteint. Les graphiques deviennent illisibles : une série
 * paraît hurler, l'autre disparaître, alors que les valeurs sont voisines.
 * OKLCH est construit sur la perception humaine : à L et C constants, toutes
 * les teintes ont le même poids visuel. C'est ce qui rend possibles
 *
 *   1. le spectre des graphiques (couche 3) — même ton sur tout le cercle ;
 *   2. la mise en thème (couche 4) — recolorer les neutres sans les assombrir.
 *
 * Les formules viennent de la définition d'Oklab par Björn Ottosson.
 */

/** Couleur en OKLCH : L ∈ [0,1], C ≥ 0, h en degrés. */
export interface Oklch {
  /** Clarté perçue, 0 = noir, 1 = blanc. */
  l: number;
  /** Chroma (saturation absolue) ; 0 = gris. */
  c: number;
  /** Teinte en degrés [0, 360). */
  h: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Linéaire → sRGB (transfert gamma). */
function gamma(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

/** sRGB → linéaire. */
function degamma(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/**
 * OKLCH → `#rrggbb`.
 *
 * Les canaux hors gamut sont bornés à [0,1]. On ne cherche pas à « mapper »
 * le gamut proprement : toutes les rampes de ce fichier sont générées avec un
 * chroma volontairement modéré, précisément pour rester dans sRGB.
 */
export function oklchToHex({ l, c, h }: Oklch): string {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const L = l_ * l_ * l_;
  const M = m_ * m_ * m_;
  const S = s_ * s_ * s_;

  const r = gamma(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S);
  const g = gamma(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S);
  const bl = gamma(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S);

  const hex = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(bl)}`;
}

/** `#rgb` / `#rrggbb` → OKLCH. */
export function hexToOklch(hex: string): Oklch {
  const s = hex.trim().replace('#', '');
  const full =
    s.length === 3
      ? s
          .split('')
          .map((d) => d + d)
          .join('')
      : s;
  const r = degamma(Number.parseInt(full.slice(0, 2), 16) / 255);
  const g = degamma(Number.parseInt(full.slice(2, 4), 16) / 255);
  const b = degamma(Number.parseInt(full.slice(4, 6), 16) / 255);

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(A * A + B * B);
  const h = c < 1e-6 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

/** Luminance relative WCAG d'une couleur hexadécimale. */
export function luminance(hex: string): number {
  const s = hex.trim().replace('#', '');
  const full =
    s.length === 3
      ? s
          .split('')
          .map((d) => d + d)
          .join('')
      : s;
  const [r, g, b] = [0, 2, 4].map((i) =>
    degamma(Number.parseInt(full.slice(i, i + 2), 16) / 255),
  );
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Rapport de contraste WCAG 2.1 entre deux couleurs (1 → 21). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Échelons d'une rampe, à la Tailwind. */
export const RAMP_STEPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export type RampStep = (typeof RAMP_STEPS)[number];
export type Ramp = Record<RampStep, string>;

/**
 * Clarté OKLCH visée par échelon. Courbe volontairement resserrée en haut
 * (50→200 : des fonds, ils doivent rester des fonds) et étalée au milieu, là
 * où vivent les couleurs d'action.
 */
const RAMP_L: Record<RampStep, number> = {
  50: 0.971,
  100: 0.938,
  200: 0.886,
  300: 0.822,
  400: 0.752,
  500: 0.684,
  600: 0.606,
  // 0.50 et pas 0.52 : le 700 est l'échelon de service du mode clair, et il
  // doit tenir le AA sur le fond du CADRE (#ebeef2), pas seulement sur le
  // blanc des cartes. Deux centièmes de clarté séparent « passe » de « ne
  // passe pas » — c'est `contrast.test.ts` qui a tranché, pas l'œil.
  700: 0.5,
  800: 0.442,
  900: 0.378,
  950: 0.276,
};

/**
 * Fraction du chroma de référence appliquée à chaque échelon : maximale au
 * cœur de la rampe (500–700), atténuée aux extrémités — sans quoi les tons
 * clairs virent au fluo et les tons foncés bouchent en noir coloré.
 */
const RAMP_C: Record<RampStep, number> = {
  50: 0.26,
  100: 0.42,
  200: 0.62,
  300: 0.82,
  400: 0.95,
  500: 1,
  600: 1,
  700: 0.9,
  800: 0.76,
  900: 0.64,
  950: 0.46,
};

/**
 * Construit une rampe 50→950 à teinte constante à partir d'une couleur de
 * référence. La teinte et le chroma de la référence sont conservés ; seule la
 * clarté suit la courbe ci-dessus. Résultat : onze tons qui se ressemblent
 * franchement — c'est le but, une rampe n'est pas onze couleurs différentes.
 */
export function buildRamp(
  base: string | Oklch,
  options: { chroma?: number; hue?: number } = {},
): Ramp {
  const ref = typeof base === 'string' ? hexToOklch(base) : base;
  const hue = options.hue ?? ref.h;
  const chroma = options.chroma ?? ref.c;
  const out = {} as Ramp;
  for (const step of RAMP_STEPS) {
    out[step] = oklchToHex({
      l: RAMP_L[step],
      c: chroma * RAMP_C[step],
      h: hue,
    });
  }
  return out;
}

/**
 * Spectre catégoriel pour les graphiques (couche 3).
 *
 * Même L et même C pour toutes les séries, teinte incrémentée d'un pas
 * régulier : aucune série ne paraît plus « forte » qu'une autre. C'est
 * exactement ce qu'aucune palette bricolée à la main ne réussit.
 */
export function buildSpectrum(
  count: number,
  { l, c, startHue = 145, step = 360 / count }: Oklch & { startHue?: number; step?: number },
): string[] {
  return Array.from({ length: count }, (_, i) =>
    oklchToHex({ l, c, h: (startHue + i * step) % 360 }),
  );
}

/**
 * Recolore un neutre pour la mise en thème (couche 4).
 *
 * Recette : baisser la clarté de `lightnessDrop`, monter le chroma de
 * `chromaGain`, poser la teinte voulue. Le neutre reste un neutre — il prend
 * juste la température du thème. Appliquée à TOUS les neutres d'un mode, elle
 * produit une déclinaison colorée cohérente sans retoucher un seul écran.
 */
export function tintNeutral(
  hex: string,
  hue: number,
  { lightnessDrop = 0.003, chromaGain = 0.02 } = {},
): string {
  const { l, c } = hexToOklch(hex);
  return oklchToHex({
    l: Math.max(0, l - lightnessDrop),
    c: c + chromaGain,
    h: hue,
  });
}
