/**
 * Formes de carte : sources SVG → `src/skins/shapes/generated.ts`.
 *
 *   bun scripts/card-shapes.ts          # régénère
 *   bun scripts/card-shapes.ts --check  # échoue si generated.ts n'est pas à jour
 *
 * Chaque `src/skins/shapes/<nom>.svg` est un dessin éditable (commentaires,
 * couleurs d'aperçu, zone sûre visible). Le script le passe à SVGO — `viewBox`
 * conservé, 2 décimales — puis n'en garde que ce que le rendu consomme : les
 * chaînes `d` du liseré et de la surface, la zone sûre, la boîte du balayage
 * et les deux ancrages. `generated.ts` est donc une DONNÉE sans dépendance,
 * importable par le web, le natif et Node ; SVGO, lui, reste une dépendance de
 * développement.
 *
 * Il en dérive aussi le chemin de découpe en UNITÉS DE BOÎTE (0 → 1), que le
 * web pose en `clip-path: url(#…)` (`clipPathUnits="objectBoundingBox"`) : un
 * `path()` CSS est en pixels et ne suivrait pas la taille de la carte.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { optimize, type Config } from 'svgo';

import { mapPath, parsePath, serializePath } from '../src/skins/shapes/path';

const ROOT = join(import.meta.dir, '..');
const DIR = join(ROOT, 'src/skins/shapes');
const OUT = join(DIR, 'generated.ts');

/** Repère commun : celui de `geometry.ts` (300 × 300/(63/88)), arrondi à 2 décimales. */
const VIEW_W = 300;
const VIEW_H = 419.05;

/** La forme par défaut ouvre la liste ; les autres suivent dans l'ordre alphabétique. */
const DEFAULT_SHAPE = 'bouclier';

const SVGO_CONFIG: Config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          /* Les éléments sont lus par leur id : ni renommage, ni fusion, ni
             conversion des repères (rect, cercles) en chemins. */
          cleanupIds: false,
          mergePaths: false,
          convertShapeToPath: false,
        },
      },
    },
  ],
};

interface ShapeOut {
  name: string;
  label: string;
  description: string;
  frame: string;
  surface: string;
  unit: string;
  safe: [number, number, number, number];
  sheen: [number, number, number, number];
  anchors: { crest: number; footer: number };
  bytes: { source: number; optimized: number };
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? m[1] : null;
}

function element(svg: string, id: string, file: string): string {
  const m = new RegExp(`<[a-z]+\\b[^>]*\\sid="${id}"[^>]*>`).exec(svg);
  if (!m) throw new Error(`${file} : élément #${id} introuvable`);
  return m[0];
}

function num(tag: string, name: string, file: string): number {
  const v = attr(tag, name);
  const n = v == null ? NaN : Number(v);
  if (!Number.isFinite(n)) throw new Error(`${file} : attribut ${name} manquant ou invalide`);
  return n;
}

function text(svg: string, tag: string): string {
  const m = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(svg);
  return m ? m[1].trim() : '';
}

function build(file: string): ShapeOut {
  const name = basename(file, '.svg');
  const source = readFileSync(join(DIR, file), 'utf8');
  const { data } = optimize(source, { ...SVGO_CONFIG, path: file });

  const viewBox = /viewBox="([^"]+)"/.exec(data)?.[1];
  if (viewBox !== `0 0 ${VIEW_W} ${VIEW_H}`) {
    throw new Error(`${file} : viewBox « ${viewBox} » ≠ « 0 0 ${VIEW_W} ${VIEW_H} »`);
  }
  /* SVGO retire le `Z` final quand le dernier segment revient déjà au point
     de départ (arc du ticket). Le remplissage n'y perd rien, le TRAIT de
     l'anneau intérieur si : sans fermeture, ses deux bouts ne se joignent pas. */
  const closed = (d: string | null) => (d && !/z\s*$/i.test(d) ? `${d}Z` : d);
  const frame = closed(attr(element(data, 'frame', file), 'd'));
  const surface = closed(attr(element(data, 'surface', file), 'd'));
  if (!frame || !surface) throw new Error(`${file} : #frame et #surface doivent porter un d`);
  const rect = (id: string): [number, number, number, number] => {
    const tag = element(data, id, file);
    return [num(tag, 'x', file), num(tag, 'y', file), num(tag, 'width', file), num(tag, 'height', file)];
  };

  /* Découpe en unités de boîte : x / 300, y / 419,05 — 4 décimales, soit
     moins d'un vingtième de pixel sur une carte de 420 px. */
  const unit = serializePath(
    mapPath(parsePath(frame), (x, y) => [x / VIEW_W, y / VIEW_H]),
    4,
  );

  return {
    name,
    label: text(source, 'title') || name,
    description: text(source, 'desc'),
    frame,
    surface,
    unit,
    safe: rect('safe'),
    sheen: rect('sheen'),
    anchors: {
      crest: num(element(data, 'crest', file), 'cy', file),
      footer: num(element(data, 'footer', file), 'cy', file),
    },
    bytes: { source: Buffer.byteLength(source), optimized: Buffer.byteLength(data) },
  };
}

function render(shapes: ShapeOut[]): string {
  const total = shapes.reduce(
    (acc, s) => ({ source: acc.source + s.bytes.source, optimized: acc.optimized + s.bytes.optimized }),
    { source: 0, optimized: 0 },
  );
  const rows = shapes
    .map(
      (s) =>
        ` *   ${s.name.padEnd(9)} ${String(s.bytes.source).padStart(5)} o → ${String(s.bytes.optimized).padStart(4)} o`,
    )
    .join('\n');
  const key = (k: string) => (/^[a-z_$][\w$]*$/i.test(k) ? k : JSON.stringify(k));
  const tuple = (r: readonly number[]) => `[${r.join(', ')}]`;
  const entries = shapes
    .map((s) =>
      [
        `  ${key(s.name)}: {`,
        `    name: ${JSON.stringify(s.name)},`,
        `    label: ${JSON.stringify(s.label)},`,
        `    description: ${JSON.stringify(s.description)},`,
        `    frame: ${JSON.stringify(s.frame)},`,
        `    surface: ${JSON.stringify(s.surface)},`,
        `    unit: ${JSON.stringify(s.unit)},`,
        `    safe: ${tuple(s.safe)},`,
        `    sheen: ${tuple(s.sheen)},`,
        `    anchors: { crest: ${s.anchors.crest}, footer: ${s.anchors.footer} },`,
        '  },',
      ].join('\n'),
    )
    .join('\n');
  const names = shapes.map((s) => JSON.stringify(s.name)).join(', ');

  return `/**
 * FICHIER GÉNÉRÉ par \`bun scripts/card-shapes.ts\` — ne pas éditer à la main.
 * Sources : \`src/skins/shapes/<nom>.svg\`, optimisées par SVGO (viewBox
 * conservé, 2 décimales). \`--check\` échoue si ce fichier n'est pas à jour.
 *
 * Poids des sources SVG, avant → après SVGO :
${rows}
 *   ${'total'.padEnd(9)} ${String(total.source).padStart(5)} o → ${String(total.optimized).padStart(4)} o
 *
 * Repère : ${VIEW_W} × ${VIEW_H} (celui de geometry.ts). \`frame\` et \`surface\` sont
 * des chaînes \`d\` prêtes à poser sur un <path> ; \`unit\` est la silhouette en
 * unités de boîte (0 → 1) pour un clipPath \`objectBoundingBox\`. Rectangles :
 * [x, y, largeur, hauteur]. Ancrages : ordonnée du bord haut de la plaque jeu
 * (\`crest\`) et du bord bas du pied (\`footer\`).
 */

export const CARD_SHAPE_VIEW = { width: ${VIEW_W}, height: ${VIEW_H} } as const;

/** Formes disponibles — la première est la forme par défaut. */
export const CARD_SHAPE_NAMES = [${names}] as const;
export type CardShapeName = (typeof CARD_SHAPE_NAMES)[number];

export interface CardShapeSource {
  name: CardShapeName;
  label: string;
  description: string;
  frame: string;
  surface: string;
  unit: string;
  safe: readonly [number, number, number, number];
  sheen: readonly [number, number, number, number];
  anchors: { readonly crest: number; readonly footer: number };
}

export const CARD_SHAPE_SOURCES: Readonly<Record<CardShapeName, CardShapeSource>> = {
${entries}
};
`;
}

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.svg'))
  .sort((a, b) => {
    if (a === `${DEFAULT_SHAPE}.svg`) return -1;
    if (b === `${DEFAULT_SHAPE}.svg`) return 1;
    return a.localeCompare(b);
  });
if (!files.includes(`${DEFAULT_SHAPE}.svg`)) {
  throw new Error(`La forme par défaut « ${DEFAULT_SHAPE}.svg » est absente de ${DIR}`);
}

const shapes = files.map(build);
const next = render(shapes);

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    current = '';
  }
  if (current !== next) {
    console.error(
      'src/skins/shapes/generated.ts n’est pas à jour : lancer `bun scripts/card-shapes.ts`.',
    );
    process.exit(1);
  }
  console.log(`Formes de carte à jour (${shapes.length}).`);
} else {
  writeFileSync(OUT, next);
  for (const s of shapes) {
    console.log(`${s.name.padEnd(9)} ${s.bytes.source} o → ${s.bytes.optimized} o`);
  }
  console.log(`→ ${OUT}`);
}
