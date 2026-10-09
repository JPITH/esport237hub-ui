/**
 * Le signe sur la carte (lot M3, 09/10/2026) — retour du porteur : « Enlève
 * la pilule. Mets le logo en filigrane gris sur la carte. Et là où était la
 * pilule, mets le logo avec une petite animation en boucle. »
 *
 * Ce que ces tests tiennent, pour CHAQUE skin intégré sur CHAQUE forme :
 *  - le filigrane est le signe lui-même (mêmes tracés), gris, discret, et ne
 *    descend jamais sur les stats ;
 *  - partout où un texte passe sur le filigrane (colonne OVR, nom, verso),
 *    l'encre garde 4,5:1 — le fond est recomposé comme le tracé le peint
 *    (`surfaceColorAt`), filigrane compris ;
 *  - le signe du pied se lit (3:1, élément graphique) sur le fond du pied ;
 *  - le web et le natif jouent la même partition (CSS comparé aux constantes),
 *    et « réduire les animations » retire l'éclat.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import {
  MARK_LETTER_G_PATH,
  MARK_LETTER_H_PATH,
  MARK_RING_PATH,
  MARK_SIZE,
} from '../lib/brand-mark';
import { CARD_MARK_CYCLE_MS, CARD_MARK_GLINT, glintTravel, polylineBounds } from '../lib/brand-motion';
import {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  CARD_BASE_WIDTH,
  CARD_REF_HEIGHT,
  CARD_SHAPE_NAMES,
  IDENTITY_BAND_ALPHA,
  MARK_MIN_CONTRAST,
  WATERMARK_GAP,
  WATERMARK_OPACITY_RANGE,
  buildSkinDraw,
  cardMarkInks,
  cardShape,
  cardTextProbes,
  watermarkRing,
  contrastRatio,
  identityBand,
  luminance,
  markInksOn,
  mixColor,
  neutralOf,
  parseColor,
  skinFromSeed,
  surfaceColorAt,
  type CardShapeName,
  type SkinSpec,
} from './index';

const AA = 4.5;
const ASPECT = CARD_BASE_WIDTH / CARD_REF_HEIGHT;
const RING = polylineBounds(MARK_RING_PATH);

/** Chaque skin intégré, sur sa forme puis sur toutes les autres. */
const CASES: [string, SkinSpec][] = BUILTIN_SKIN_KEYS.flatMap((key) =>
  CARD_SHAPE_NAMES.map((shape): [string, SkinSpec] => {
    const base = BUILTIN_SKINS[key];
    const spec = (base.shape ?? 'bouclier') === shape ? base : { ...base, key: `${key}@${shape}`, shape };
    return [`${key} / ${shape}`, spec];
  }),
);

function hex(css: string): string {
  const c = parseColor(css)!;
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** Vrai si le point (fractions de la carte) tombe dans la boîte du cadre hexagonal du filigrane. */
function underWatermark(skin: SkinSpec, x: number, y: number): boolean {
  const ring = watermarkRing(cardShape(skin.shape).watermark);
  return x >= ring.x && x <= ring.x + ring.width && y >= ring.y && y <= ring.y + ring.height;
}

/**
 * Fond sous un texte, filigrane compris — au pire : comme si le point
 * tombait sur une pièce PLEINE du signe (le cadre, le « H »).
 */
function backgroundAt(skin: SkinSpec, x: number, y: number): string {
  const bare = surfaceColorAt(skin, x, y);
  if (!underWatermark(skin, x, y)) return bare;
  const wm = buildSkinDraw(skin, 't').watermark;
  return mixColor(bare, wm.color, wm.opacity);
}

/** Grille de points d'une boîte de gabarit. */
function grid(box: { top: number; left: number; width: number }, height: number, n = 6): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++) points.push([box.left + (box.width * i) / n, box.top + (height * j) / n]);
  return points;
}

describe('le filigrane : le signe, gris, derrière le portrait', () => {
  test('ce sont les tracés du signe, et eux seuls', () => {
    const wm = buildSkinDraw(BUILTIN_SKINS.signature, 't').watermark;
    expect(wm.parts.map((p) => p.d)).toEqual([MARK_RING_PATH, MARK_LETTER_G_PATH, MARK_LETTER_H_PATH]);
    expect(wm.scale).toBeCloseTo(wm.size / MARK_SIZE, 6);
  });

  test.each(CARD_SHAPE_NAMES.map((n) => [n] as const))('%s : grand, centré, au-dessus des stats', (name) => {
    const shape = cardShape(name as CardShapeName);
    const box = shape.watermark;
    // Carré en pixels.
    expect(box.height).toBeCloseTo(box.width * ASPECT, 6);
    // Grand : au moins les trois quarts de la largeur de la carte.
    expect(box.width).toBeGreaterThanOrEqual(0.75);
    // Dans la carte, centré sur la zone sûre.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1);
    expect(box.x + box.width / 2).toBeCloseTo(shape.safe.x + shape.safe.width / 2, 2);
    // Le bas du cadre hexagonal s'arrête au-dessus des stats.
    const ringBottom = box.y + (RING.maxY / MARK_SIZE) * box.height;
    expect(ringBottom).toBeLessThanOrEqual(shape.layout.stats.top - WATERMARK_GAP + 1e-9);
    // Et son haut sous la plaque du jeu.
    expect(box.y + (RING.minY / MARK_SIZE) * box.height).toBeGreaterThan(shape.layout.crest.top + 0.04);
  });

  test.each(BUILTIN_SKIN_KEYS.map((k) => [k] as const))('%s : un gris de l’encre, à faible dose', (key) => {
    const skin = BUILTIN_SKINS[key];
    const wm = buildSkinDraw(skin, 't').watermark;
    const c = parseColor(wm.color)!;
    expect(c.r).toBe(c.g);
    expect(c.g).toBe(c.b);
    // Du côté de l'encre : clair sur une carte sombre, sombre sur la carte OR.
    expect(Math.abs(luminance(wm.color) - luminance(skin.ink))).toBeLessThan(0.01);
    // La borne basse cède au garde-fou de lisibilité (champion : halo doré sous le verso).
    expect(wm.opacity).toBeGreaterThanOrEqual(0.03);
    expect(wm.opacity).toBeLessThanOrEqual(WATERMARK_OPACITY_RANGE[1]);
    // Visible : il se distingue de la surface qu'il recouvre.
    const box = cardShape(skin.shape).watermark;
    const under = surfaceColorAt(skin, box.x + box.width / 2, box.y + box.height / 2);
    expect(contrastRatio(under, mixColor(under, wm.color, wm.opacity))).toBeGreaterThanOrEqual(1.08);
  });

  test('neutralOf garde la luminance et retire la teinte', () => {
    for (const css of ['#eafff3', '#241702', '#35e1e1', '#fcd116']) {
      const n = neutralOf(css);
      expect(Math.abs(luminance(n) - luminance(css))).toBeLessThan(0.01);
      const c = parseColor(n)!;
      expect(new Set([c.r, c.g, c.b]).size).toBe(1);
    }
  });
});

describe('lisibilité avec le filigrane (4,5:1)', () => {
  test.each(CARD_SHAPE_NAMES.map((n) => [n] as const))(
    '%s : le cadre du filigrane ne touche pas les stats du recto',
    (name) => {
      const shape = cardShape(name as CardShapeName);
      const ring = watermarkRing(shape.watermark);
      // Les stats commencent sous le cadre : leur fond est EXACTEMENT celui
      // d'avant le filigrane, leur contraste ne bouge pas d'un centième.
      expect(ring.y + ring.height).toBeLessThan(shape.layout.stats.top);
      for (const [x, y] of grid(shape.layout.stats, 0.16)) {
        expect(underWatermark(BUILTIN_SKINS.signature, x, y) && y >= shape.layout.stats.top).toBe(false);
      }
    },
  );

  test.each(CASES)('%s : OVR, verso — jamais sous 4,5:1 à cause du filigrane', (_, skin) => {
    for (const [x, y] of cardTextProbes(cardShape(skin.shape), 12)) {
      const bare = contrastRatio(skin.ink, surfaceColorAt(skin, x, y));
      const marked = contrastRatio(skin.ink, backgroundAt(skin, x, y));
      expect(marked).toBeGreaterThanOrEqual(Math.min(AA, bare) - 1e-9);
    }
  });

  test.each(CASES)('%s : le nom, sur son bandeau, filigrane derrière', (_, skin) => {
    const L = cardShape(skin.shape).layout;
    const band = parseColor(identityBand(skin))!;
    const bandHex = hex(`rgb(${band.r},${band.g},${band.b})`);
    for (const [x, y] of grid(L.identity, 0.06, 4)) {
      const behind = backgroundAt(skin, x, y);
      const composite = mixColor(bandHex, behind, 1 - IDENTITY_BAND_ALPHA);
      expect(contrastRatio(skin.ink, composite)).toBeGreaterThanOrEqual(AA);
    }
  });

  /*
   * Sur leur forme d'origine, les skins intégrés tiennent 4,5:1 PARTOUT où
   * le filigrane passe sous un texte — pas seulement « pas pire qu'avant ».
   */
  test.each(BUILTIN_SKIN_KEYS.map((k) => [k] as const))('%s : 4,5:1 sous le cadre du filigrane', (key) => {
    const skin = BUILTIN_SKINS[key];
    const ring = watermarkRing(cardShape(skin.shape).watermark);
    for (const [x, y] of cardTextProbes(cardShape(skin.shape), 12)) {
      if (x < ring.x || x > ring.x + ring.width || y < ring.y || y > ring.y + ring.height) continue;
      expect(contrastRatio(skin.ink, backgroundAt(skin, x, y))).toBeGreaterThanOrEqual(AA);
    }
  });

  test('un skin du dashboard aux tons serrés : la dose baisse plutôt que l’encre', () => {
    // Encre claire sur un fond moyen : à peine plus de 4,5:1 — un filigrane
    // clair à pleine dose l'aurait fait passer dessous.
    const skin = skinFromSeed({ key: 'serre', label: 'Serré', background: '#4f5560', frame: '#3b4250', ink: '#f2f2f2' });
    const wm = buildSkinDraw(skin, 't').watermark;
    expect(wm.opacity).toBeLessThan(WATERMARK_OPACITY_RANGE[1]);
    for (const [x, y] of cardTextProbes(cardShape(skin.shape), 12)) {
      const bare = contrastRatio(skin.ink, surfaceColorAt(skin, x, y));
      expect(contrastRatio(skin.ink, backgroundAt(skin, x, y))).toBeGreaterThanOrEqual(Math.min(AA, bare) - 1e-9);
    }
  });

  /*
   * Relevés pendant le lot M3, ANTÉRIEURS au filigrane (qui ne passe sur
   * aucun de ces points — vérifié ci-dessus) : la surface y est trop proche
   * de l'encre. Mesuré sur une capture pour la carte OR (~3:1).
   */
  const everywhere = (key: 'gold' | 'champion') => () => {
    const skin = BUILTIN_SKINS[key];
    const shape = cardShape(skin.shape);
    const points = [...grid(shape.layout.stats, 0.15), ...cardTextProbes(shape)];
    for (const [x, y] of points) {
      expect(contrastRatio(skin.ink, backgroundAt(skin, x, y))).toBeGreaterThanOrEqual(AA);
    }
  };
  test.todo(
    'or : les deux dernières rangées de stats du recto et le bilan du verso à 4,5:1 (bas de surface #6f5a1c)',
    everywhere('gold'),
  );
  test.todo('champion : le titre du verso à 4,5:1 sur le halo doré du haut', everywhere('champion'));
});

describe('le signe du pied, là où était la pilule', () => {
  test.each(CASES)('%s : lisible sur le fond du pied (3:1)', (_, skin) => {
    const spot = cardShape(skin.shape).markSpot;
    const bg = surfaceColorAt(skin, spot.x, spot.y);
    const inks = cardMarkInks(skin);
    expect(contrastRatio(inks.accent, bg)).toBeGreaterThanOrEqual(MARK_MIN_CONTRAST);
    expect(contrastRatio(inks.contrast, bg)).toBeGreaterThanOrEqual(MARK_MIN_CONTRAST);
    // Variante pleine (sous 20 px) : le monogramme se détache de l'hexagone.
    expect(contrastRatio(inks.onAccent, inks.accent)).toBeGreaterThanOrEqual(MARK_MIN_CONTRAST);
  });

  test('les encres viennent du skin : accent et encre quand ils se lisent', () => {
    const inks = cardMarkInks(BUILTIN_SKINS.signature);
    expect(inks.accent).toBe(BUILTIN_SKINS.signature.accent);
    expect(inks.contrast).toBe(BUILTIN_SKINS.signature.ink);
  });

  test('sur la carte OR, l’accent brun cède au clair du liseré', () => {
    const gold = BUILTIN_SKINS.gold;
    const inks = cardMarkInks(gold);
    expect(inks.accent).not.toBe(gold.accent);
    expect(inks.accent).toBe(gold.frame.stops[0].color);
  });

  test('le pied est posé au milieu du bloc footer, sur son bord bas', () => {
    for (const name of CARD_SHAPE_NAMES) {
      const shape = cardShape(name);
      expect(shape.markSpot.x).toBeCloseTo(shape.layout.footer.left + shape.layout.footer.width / 2, 6);
      expect(shape.markSpot.y).toBeLessThan(1 - shape.layout.footer.bottom);
      expect(shape.markSpot.y).toBeGreaterThan(shape.layout.stats.top);
    }
  });

  test('aucune encre lisible ? la plus contrastée, jamais une couleur inventée', () => {
    const inks = markInksOn({ ink: '#808080', accent: '#808080', frame: BUILTIN_SKINS.signature.frame }, '#7f7f7f');
    // Le clair du liseré passe : il est choisi.
    expect(inks.accent).toBe(BUILTIN_SKINS.signature.frame.stops[0].color);
  });
});

describe('l’éclat : une partition, deux plateformes', () => {
  test('la bande traverse puis se repose', () => {
    const [from, to] = CARD_MARK_GLINT.sweep;
    expect(glintTravel(from)).toBe(0);
    expect(glintTravel(to)).toBe(1);
    expect(glintTravel(0.9)).toBe(1);
    let last = -1;
    for (let t = 0; t <= 1; t += 0.01) {
      const v = glintTravel(t);
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
    // Adoucie : symétrique autour du milieu de la traversée.
    expect(glintTravel((from + to) / 2)).toBeCloseTo(0.5, 6);
    expect(CARD_MARK_CYCLE_MS).toBeGreaterThanOrEqual(2000);
    expect(CARD_MARK_CYCLE_MS).toBeLessThanOrEqual(4000);
  });

  const css = readFileSync(join(import.meta.dir, '../theme/components.css'), 'utf8');

  test('le CSS du web recopie la partition', () => {
    const keyframes = /@keyframes pc-mark-glint\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    expect(keyframes).toContain(`${Math.round(CARD_MARK_GLINT.sweep[1] * 100)}%`);
    expect(css).toMatch(new RegExp(`animation:\\s*pc-mark-glint\\s+${CARD_MARK_CYCLE_MS}ms`));
    expect(css).toContain(`linear-gradient(${90 + CARD_MARK_GLINT.angleDeg}deg`);
  });

  test('« réduire les animations » retire l’éclat ; la pilule n’existe plus', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.pcard__mark \.pcard__mark-glint\s*\{\s*display:\s*none;/,
    );
    expect(css).not.toContain('.pcard__chip');
  });
});
