/**
 * Jeu d'icônes G-HUB — compression des sources et génération des composants.
 *
 *   bun scripts/icons.ts           # optimise src/icons/svg/*.svg (SVGO) et régénère
 *   bun scripts/icons.ts --check   # échoue si une source n'est pas optimisée ou
 *                                  # si un fichier généré n'est pas à jour
 *
 * Une seule donnée, les TRACÉS des sources, produit quatre fichiers :
 *   src/icons/names.ts            union typée des noms (`IconName`)
 *   src/icons/generated/data.ts   les tracés par icône, rangés par couche
 *   src/icons/generated/web.tsx   `<Icon>` React DOM (SVG en ligne)
 *   src/icons/generated/native.tsx `<Icon>` react-native-svg
 *
 * La grammaire (grille, trait, chanfrein, variante active) est décrite dans
 * src/icons/README.md ; le test src/icons/icons.test.ts la fait respecter.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { optimize, type Config } from 'svgo';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ICONS_DIR = join(ROOT, 'src/icons');
export const SVG_DIR = join(ICONS_DIR, 'svg');

/** Réglage SVGO : préréglage par défaut, dimensions fixes retirées, 2 décimales. */
export const SVGO_CONFIG: Config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // La couche « active » est cachée dans la source (visibility="hidden") :
          // la retirer comme un élément invisible effacerait la variante.
          removeHiddenElems: false,
        },
      },
    },
    'removeDimensions',
    'removeTitle',
  ],
};

export type Layer = 's' | 'f' | 'a';
/** s : traits ; f : aplats pleins (points) ; a : aplat de la variante active. */
export type Glyph = Partial<Record<Layer, string[]>>;

const ROOT_ATTRS: Record<string, string> = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.75',
  'stroke-linejoin': 'bevel',
};

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) out[m[1]!] = m[2]!;
  return out;
}

/** Lit un SVG OPTIMISÉ et range ses tracés par couche. Lève sur toute entorse. */
export function parseGlyph(name: string, svg: string): Glyph {
  const root = svg.match(/^<svg\b([^>]*)>/);
  if (!root) throw new Error(`${name} : pas de balise <svg> en tête`);
  const ra = attrs(root[1]!);
  for (const [k, v] of Object.entries(ROOT_ATTRS)) {
    if (ra[k] !== v) throw new Error(`${name} : <svg ${k}="${ra[k]}"> au lieu de "${v}"`);
  }
  // `stroke-linecap="butt"` est la valeur par défaut : SVGO la retire.
  const extra = Object.keys(ra).filter((k) => !(k in ROOT_ATTRS));
  if (extra.length) throw new Error(`${name} : attribut(s) racine inattendu(s) ${extra.join(', ')}`);

  const inner = svg.slice(root[0].length).replace(/<\/svg>\s*$/, '');
  const elements = [...inner.matchAll(/<([a-zA-Z]+)\b([^>]*?)\/>/g)];
  const rest = inner.replace(/<([a-zA-Z]+)\b([^>]*?)\/>/g, '').trim();
  if (rest) throw new Error(`${name} : contenu non pris en charge « ${rest.slice(0, 60)} »`);

  const glyph: Glyph = {};
  for (const [, tag, body] of elements) {
    if (tag !== 'path') throw new Error(`${name} : élément <${tag}> interdit (tracés <path> seulement)`);
    const a = attrs(body!);
    const d = a.d;
    if (!d) throw new Error(`${name} : <path> sans d`);
    const keys = Object.keys(a).filter((k) => k !== 'd').sort().join(',');
    let layer: Layer;
    if (a.class === 'gh-active') {
      if (keys !== 'class,fill,fill-opacity,stroke,visibility' || a.fill !== 'currentColor' || a.stroke !== 'none' || a.visibility !== 'hidden' || a['fill-opacity'] !== '.25') {
        throw new Error(`${name} : couche active mal formée (${keys})`);
      }
      layer = 'a';
    } else if (keys === 'fill,stroke' && a.fill === 'currentColor' && a.stroke === 'none') {
      layer = 'f';
    } else if (keys === '') {
      layer = 's';
    } else {
      throw new Error(`${name} : attributs de <path> non autorisés (${keys})`);
    }
    (glyph[layer] ??= []).push(d);
  }
  if (!glyph.s && !glyph.f) throw new Error(`${name} : aucun tracé visible`);
  return glyph;
}

const HEADER = (what: string) =>
  `// FICHIER GÉNÉRÉ par scripts/icons.ts — ne pas modifier à la main.\n` +
  `// Source : src/icons/svg/*.svg. ${what}\n`;

function genNames(names: string[]): string {
  return (
    HEADER('Régénérer : `bun scripts/icons.ts`.') +
    `\n/** Les ${names.length} icônes du jeu G-HUB, par ordre alphabétique. */\n` +
    `export const ICON_NAMES = [\n${names.map((n) => `  '${n}',`).join('\n')}\n] as const;\n\n` +
    `export type IconName = (typeof ICON_NAMES)[number];\n`
  );
}

function genData(glyphs: Map<string, Glyph>): string {
  const lines: string[] = [];
  for (const [name, g] of glyphs) {
    const parts = (['s', 'f', 'a'] as const)
      .filter((k) => g[k])
      .map((k) => `${k}: [${g[k]!.map((d) => `'${d}'`).join(', ')}]`);
    lines.push(`  '${name}': { ${parts.join(', ')} },`);
  }
  return (
    HEADER('Une seule donnée pour le web et le natif.') +
    `import type { IconName } from '../names';\n\n` +
    `/** Grille de dessin : un carré de 24, zone utile 20 (2 → 22). */\n` +
    `export const ICON_VIEW_BOX = '0 0 24 24';\n` +
    `/** Épaisseur du trait unique du jeu. */\n` +
    `export const ICON_STROKE_WIDTH = 1.75;\n` +
    `/** Opacité de l'aplat de la variante active. */\n` +
    `export const ICON_ACTIVE_OPACITY = 0.25;\n\n` +
    `/**\n * Tracés par couche : \`s\` les traits (encre, trait 1,75, jonctions\n` +
    ` * biseautées), \`f\` les aplats pleins (points en losange), \`a\` l'aplat\n` +
    ` * partiel de la variante active.\n */\n` +
    `export interface IconGlyph {\n  readonly s?: readonly string[];\n  readonly f?: readonly string[];\n  readonly a?: readonly string[];\n}\n\n` +
    `export const ICON_GLYPHS: Readonly<Record<IconName, IconGlyph>> = {\n${lines.join('\n')}\n};\n`
  );
}

const GEN_WEB = `${HEADER('Le gabarit vit dans scripts/icons.ts.')}import type { CSSProperties } from 'react';

import type { IconName } from '../names';
import { ICON_ACTIVE_OPACITY, ICON_GLYPHS, ICON_STROKE_WIDTH, ICON_VIEW_BOX } from './data';

export interface IconProps {
  /** Nom de l'icône dans le jeu G-HUB. */
  name: IconName;
  /** Côté en pixels (défaut 24). */
  size?: number;
  /** Encre ; par défaut \`currentColor\` — l'icône suit le texte qui l'entoure. */
  color?: string;
  /** Variante active (onglet sélectionné) : trait + aplat partiel. */
  active?: boolean;
  /**
   * Variante pleine : l'aplat de la variante active, à pleine encre — un état
   * coché (favori, note). Sans effet sur une icône sans aplat.
   */
  filled?: boolean;
  /** Épaisseur du trait (défaut 1,75 — la grammaire du jeu). */
  strokeWidth?: number;
  /** Libellé accessible ; absent, l'icône est décorative. */
  accessibilityLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/** Icône du jeu G-HUB en SVG en ligne — aucune couleur en dur. */
export function Icon({
  name,
  size = 24,
  color = 'currentColor',
  active = false,
  filled = false,
  strokeWidth = ICON_STROKE_WIDTH,
  accessibilityLabel,
  className,
  style,
}: IconProps) {
  const g = ICON_GLYPHS[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={ICON_VIEW_BOX}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="bevel"
      className={className}
      style={style}
      role={accessibilityLabel ? 'img' : undefined}
      aria-label={accessibilityLabel}
      aria-hidden={accessibilityLabel ? undefined : true}
      focusable="false"
      data-icon={name}
    >
      {(active || filled) &&
        g.a?.map((d, i) => (
          <path key={\`a\${i}\`} d={d} fill={color} fillOpacity={filled ? 1 : ICON_ACTIVE_OPACITY} stroke="none" />
        ))}
      {g.s?.map((d, i) => <path key={\`s\${i}\`} d={d} />)}
      {g.f?.map((d, i) => <path key={\`f\${i}\`} d={d} fill={color} stroke="none" />)}
    </svg>
  );
}
`;

const GEN_NATIVE = `${HEADER('Le gabarit vit dans scripts/icons.ts.')}import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useE237Colors } from '../../native/core';
import type { IconName } from '../names';
import { ICON_ACTIVE_OPACITY, ICON_GLYPHS, ICON_STROKE_WIDTH, ICON_VIEW_BOX } from './data';

export interface IconProps {
  /** Nom de l'icône dans le jeu G-HUB. */
  name: IconName;
  /** Côté en pixels (défaut 24). */
  size?: number;
  /** Encre ; par défaut le texte primaire du thème (\`useE237Colors\`). */
  color?: string;
  /** Variante active (onglet sélectionné) : trait + aplat partiel. */
  active?: boolean;
  /**
   * Variante pleine : l'aplat de la variante active, à pleine encre — un état
   * coché (favori, note). Sans effet sur une icône sans aplat.
   */
  filled?: boolean;
  /** Épaisseur du trait (défaut 1,75 — la grammaire du jeu). */
  strokeWidth?: number;
  /** Libellé accessible ; absent, l'icône est décorative. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Icône du jeu G-HUB (react-native-svg) — aucune couleur en dur. */
export function Icon({
  name,
  size = 24,
  color,
  active = false,
  filled = false,
  strokeWidth = ICON_STROKE_WIDTH,
  accessibilityLabel,
  style,
  testID,
}: IconProps) {
  const c = useE237Colors();
  const ink = color ?? c.textPrimary;
  const g = ICON_GLYPHS[name];
  return (
    <Svg
      viewBox={ICON_VIEW_BOX}
      width={size}
      height={size}
      style={style}
      testID={testID}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      // \`accessible\` (vrai ou faux) descendrait jusqu'au DOM sous
      // react-native-web (« Received \`true\` for a non-boolean attribute ») :
      // natif seulement ; sur le web, rôle + libellé suffisent — voir mark.tsx.
      accessible={accessibilityLabel && Platform.OS !== 'web' ? true : undefined}
    >
      {(active || filled) &&
        g.a?.map((d, i) => (
          <Path key={\`a\${i}\`} d={d} fill={ink} fillOpacity={filled ? 1 : ICON_ACTIVE_OPACITY} />
        ))}
      {g.s?.map((d, i) => (
        <Path key={\`s\${i}\`} d={d} fill="none" stroke={ink} strokeWidth={strokeWidth} strokeLinejoin="bevel" />
      ))}
      {g.f?.map((d, i) => <Path key={\`f\${i}\`} d={d} fill={ink} />)}
    </Svg>
  );
}
`;

export interface BuildResult {
  names: string[];
  sources: Map<string, { before: string; after: string }>;
  files: Map<string, string>;
}

/** Calcule tout en mémoire — sources optimisées et fichiers générés. */
export function build(): BuildResult {
  const names = readdirSync(SVG_DIR)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4))
    .sort();
  const sources = new Map<string, { before: string; after: string }>();
  const glyphs = new Map<string, Glyph>();
  for (const name of names) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) throw new Error(`${name}.svg : nom hors kebab-case`);
    const before = readFileSync(join(SVG_DIR, `${name}.svg`), 'utf8');
    const after = `${optimize(before, { ...SVGO_CONFIG, path: `${name}.svg` }).data}\n`;
    sources.set(name, { before, after });
    glyphs.set(name, parseGlyph(name, after.trim()));
  }
  const files = new Map<string, string>([
    [join(ICONS_DIR, 'names.ts'), genNames(names)],
    [join(ICONS_DIR, 'generated/data.ts'), genData(glyphs)],
    [join(ICONS_DIR, 'generated/web.tsx'), GEN_WEB],
    [join(ICONS_DIR, 'generated/native.tsx'), GEN_NATIVE],
  ]);
  return { names, sources, files };
}

/**
 * Planche de contrôle : chaque icône, normale et active, à 16 / 24 / 32 px,
 * en clair et en sombre. Les encres sont celles des jetons (`color.light` /
 * `color.dark`), jamais des valeurs choisies ici.
 */
async function sheet(out: string) {
  const { color } = await import('../src/tokens');
  const { names, sources } = build();
  const svgOf = (name: string, size: number, active: boolean) => {
    const src = sources.get(name)!.after.trim();
    const body = active ? src.replace(/ visibility="hidden"/g, '') : src;
    return body.replace('<svg ', `<svg width="${size}" height="${size}" `);
  };
  const panel = (mode: 'light' | 'dark') => {
    const c = color[mode];
    const cells = names
      .map(
        (n) => `<figure><div class="row">${[16, 24, 32].map((s) => svgOf(n, s, false)).join('')}</div>` +
          `<div class="row act">${[16, 24, 32].map((s) => svgOf(n, s, true)).join('')}</div><figcaption>${n}</figcaption></figure>`,
      )
      .join('');
    return `<section style="background:${c.bg};color:${c.textPrimary}"><h2 style="color:${c.textStrong}">${mode === 'light' ? 'Clair' : 'Sombre'} — normal (haut) / actif (bas, encre accent)</h2>` +
      `<div class="grid" style="--card:${c.surface};--line:${c.border};--accent:${c.accent};--muted:${c.textMuted}">${cells}</div></section>`;
  };
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Icônes G-HUB</title><style>
body{margin:0;font:12px/1.3 system-ui,sans-serif}section{padding:16px}h2{font-size:14px;margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(9,1fr);gap:6px}
figure{margin:0;padding:6px 4px;background:var(--card);border:1px solid var(--line);border-radius:6px;text-align:center}
.row{display:flex;gap:6px;align-items:flex-end;justify-content:center;min-height:34px}.act{color:var(--accent)}
figcaption{margin-top:4px;color:var(--muted);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style></head><body>${panel('light')}${panel('dark')}</body></html>`;
  writeFileSync(out, html);
  console.log(`Planche : ${out} (${names.length} icônes)`);
}

function main() {
  const sheetAt = process.argv.indexOf('--sheet');
  if (sheetAt !== -1) {
    void sheet(process.argv[sheetAt + 1] ?? 'icons-sheet.html');
    return;
  }
  const check = process.argv.includes('--check');
  const { names, sources, files } = build();
  const stale: string[] = [];
  let before = 0;
  let after = 0;
  for (const [name, s] of sources) {
    before += Buffer.byteLength(s.before);
    after += Buffer.byteLength(s.after);
    if (s.before !== s.after) {
      if (check) stale.push(`src/icons/svg/${name}.svg (non optimisé)`);
      else writeFileSync(join(SVG_DIR, `${name}.svg`), s.after);
    }
  }
  for (const [path, content] of files) {
    const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (current === content) continue;
    if (check) stale.push(path.slice(ROOT.length + 1));
    else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    }
  }
  if (check) {
    if (stale.length) {
      console.error(`Icônes pas à jour — lancer \`bun scripts/icons.ts\` :\n  ${stale.join('\n  ')}`);
      process.exit(1);
    }
    console.log(`Icônes à jour : ${names.length} SVG, ${after} octets.`);
    return;
  }
  const pct = before ? Math.round((1 - after / before) * 100) : 0;
  console.log(`${names.length} icônes — SVG ${before} → ${after} octets (−${pct} %). Fichiers générés à jour.`);
}

if (import.meta.main) main();
