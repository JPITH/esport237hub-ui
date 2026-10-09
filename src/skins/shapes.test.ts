/**
 * Formes de carte (SkinSpec v2) — la silhouette est une donnée, le contenu
 * doit rester lisible dans chacune, et un skin d'avant les formes ne doit pas
 * bouger d'un pixel. `bun test src/skins` depuis packages/ui.
 */
import { createHash } from 'node:crypto';
import { describe, expect, test } from 'bun:test';

import { color as themeColor, contrast, ramp } from '../tokens';
import {
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  CARD_BASE_WIDTH,
  CARD_REF_HEIGHT,
  CARD_SHAPE_NAMES,
  DEFAULT_CARD_SHAPE,
  SKIN_SPEC_VERSION,
  buildSkinDraw,
  cardShape,
  cardShapes,
  parseColor,
  parseSkinSpec,
  seedFromSkin,
  shapePoints,
  skinCssVars,
  skinFromSeed,
  surfaceLinear,
  type SkinSpec,
} from './index';
import { CARD_SHAPE_SOURCES, CARD_SHAPE_VIEW } from './shapes/generated';
import {
  distanceToEdge,
  flattenPath,
  parsePath,
  pathBounds,
  pointInPolys,
  type Point,
} from './shapes/path';

const W = CARD_SHAPE_VIEW.width;
const H = CARD_SHAPE_VIEW.height;

/** Points régulièrement espacés (pas `step` px) sur le pourtour d'un rectangle. */
function perimeter(x: number, y: number, w: number, h: number, step = 2): Point[] {
  const pts: Point[] = [];
  for (let t = 0; t <= w; t += step) pts.push([x + t, y], [x + t, y + h]);
  for (let t = 0; t <= h; t += step) pts.push([x, y + t], [x + w, y + t]);
  pts.push([x + w, y + h]);
  return pts;
}

/** Aire (formule du lacet) d'une polyligne fermée. */
function area(poly: readonly Point[]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  }
  return Math.abs(a) / 2;
}

describe.each(CARD_SHAPE_NAMES.map((n) => [n] as const))('forme « %s »', (name) => {
  const shape = cardShape(name);
  const src = CARD_SHAPE_SOURCES[name];
  const frame = flattenPath(parsePath(src.frame));
  const surface = flattenPath(parsePath(src.surface));
  const inside = (polys: Point[][], [x, y]: Point) => pointInPolys(polys, x, y);

  test('chemins valides, fermés, dans le repère de la carte', () => {
    for (const d of [src.frame, src.surface, shape.framePath, shape.surfacePath]) {
      expect(() => parsePath(d)).not.toThrow();
      expect(d.trim()).toMatch(/z$/i);
    }
    const b = pathBounds(parsePath(src.frame));
    expect(b.x).toBeGreaterThanOrEqual(-0.01);
    expect(b.y).toBeGreaterThanOrEqual(-0.01);
    expect(b.x + b.width).toBeLessThanOrEqual(W + 0.01);
    expect(b.y + b.height).toBeLessThanOrEqual(H + 0.01);
    /* Une carte, pas un confetti : la silhouette occupe l'essentiel du format. */
    expect(area(frame[0]) / (W * H)).toBeGreaterThan(0.8);
    expect(frame).toHaveLength(1);
    expect(surface).toHaveLength(1);
  });

  test('la surface est dans le liseré', () => {
    for (const p of surface[0]) {
      expect(inside(frame, p) || distanceToEdge(frame, p[0], p[1]) < 0.05).toBe(true);
    }
    expect(area(surface[0])).toBeLessThan(area(frame[0]));
  });

  test('la zone sûre est contenue dans la silhouette, et dans la surface', () => {
    const [x, y, w, h] = src.safe;
    /* Le bouclier est la RÉFÉRENCE d'avant les formes : les coins de sa
       colonne badge mordent de 2,4 px sur le liseré (le texte y est centré,
       rien ne touche). Il est tenu à cette tolérance ; toute nouvelle forme
       doit loger sa zone sûre strictement dans la surface. */
    const tolerance = name === DEFAULT_CARD_SHAPE ? 3 : 0;
    for (const p of perimeter(x, y, w, h)) {
      expect(inside(frame, p)).toBe(true);
      expect(inside(surface, p) || distanceToEdge(surface, p[0], p[1]) <= tolerance).toBe(true);
    }
    /* Le texte ne rétrécit pas avec la forme : la zone sûre reste proche de
       celle du bouclier, pour laquelle les corps ont été choisis. */
    const ref = cardShape(DEFAULT_CARD_SHAPE).safe;
    expect(shape.safe.width).toBeGreaterThanOrEqual(ref.width * 0.95);
    expect(shape.safe.height).toBeGreaterThanOrEqual(ref.height * 0.95);
  });

  test('le gabarit (recto et verso) tombe dans la zone sûre', () => {
    const s = shape.safe;
    const blocks = [
      shape.layout.badge,
      shape.layout.identity,
      shape.layout.stats,
      shape.backLayout.title,
      shape.backLayout.stats,
      shape.backLayout.record,
    ];
    for (const b of blocks) {
      expect(b.left).toBeGreaterThanOrEqual(s.x - 1e-4);
      expect(b.left + b.width).toBeLessThanOrEqual(s.x + s.width + 1e-4);
      expect(b.top).toBeGreaterThanOrEqual(s.y - 1e-4);
      expect(b.top).toBeLessThan(s.y + s.height);
    }
    const st = shape.backLayout.stats;
    expect(st.top + st.height).toBeLessThanOrEqual(s.y + s.height + 1e-4);
  });

  test('les ancrages de la plaque et du pied tombent dans la forme', () => {
    const { crest, footer } = src.anchors;
    /* Plaque jeu (~23 px de haut) : posée SUR le liseré — son bord haut peut
       dépasser, sa base repose dans la silhouette, et elle s'arrête avant le
       contenu. */
    expect(crest).toBeGreaterThanOrEqual(0);
    expect(inside(frame, [150, crest + 23])).toBe(true);
    expect(crest + 23).toBeLessThanOrEqual(src.safe[1]);
    /* Pied (~60 × 20 px) : entièrement dans la surface, sous le contenu. */
    for (const p of [
      [150, footer],
      [120, footer - 1],
      [180, footer - 1],
      [120, footer - 20],
      [180, footer - 20],
    ] as Point[]) {
      expect(inside(surface, p)).toBe(true);
    }
    expect(footer - 20).toBeGreaterThanOrEqual(src.safe[1] + src.safe[3]);
    /* Le gabarit en tient compte. */
    expect(shape.layout.crest.top).toBeCloseTo(crest / H, 4);
    expect(shape.layout.footer.bottom).toBeCloseTo(1 - footer / H, 4);
  });

  /* Le bouclier garde sa bande historique pleine largeur, que le web découpe
     au `polygon()` CSS : seules les formes nouvelles courent dans une boîte. */
  test.skipIf(name === DEFAULT_CARD_SHAPE)('le balayage « foil » court sans sortir de la silhouette', () => {
    const [x, y, w, h] = src.sheen;
    for (const p of perimeter(x, y, w, h)) {
      expect(inside(frame, p) || distanceToEdge(frame, p[0], p[1]) < 0.5).toBe(true);
    }
  });

  test('la découpe en unités de boîte reproduit la silhouette', () => {
    const unit = flattenPath(parsePath(src.unit))[0].map(([x, y]) => [x * W, y * H] as Point);
    /* Chaque point de la découpe est sur le contour du liseré (≤ 0,1 px). */
    for (const p of unit) expect(distanceToEdge(frame, p[0], p[1])).toBeLessThan(0.1);
    expect(Math.abs(area(unit) - area(frame[0])) / area(frame[0])).toBeLessThan(0.002);
  });
});

describe('le bouclier, forme par défaut', () => {
  test('« bouclier.svg » transcrit exactement CARD_SHAPE', () => {
    const legacy = shapePoints(CARD_BASE_WIDTH, CARD_REF_HEIGHT)
      .split(' ')
      .map((p) => p.split(',').map(Number));
    const svg = flattenPath(parsePath(CARD_SHAPE_SOURCES.bouclier.frame))[0];
    expect(svg).toHaveLength(legacy.length);
    svg.forEach(([x, y], i) => {
      expect(Math.abs(x - legacy[i][0])).toBeLessThan(0.02);
      expect(Math.abs(y - legacy[i][1])).toBeLessThan(0.02);
    });
  });

  test('il garde ses gabarits d’origine, objets compris', () => {
    const b = cardShape();
    expect(b.name).toBe('bouclier');
    expect(cardShape('bouclier')).toBe(b);
    expect(b.clipUnit).toBeNull();
    expect(cardShapes()[0]).toBe(b);
  });

  test('un nom inconnu ou corrompu rend le bouclier', () => {
    for (const v of ['losange', '', null, undefined, 'Hexa', ' hexa']) {
      expect(cardShape(v).name).toBe('bouclier');
    }
  });
});

/**
 * Empreintes de la liste de tracé et des variables CSS AVANT l'arrivée des
 * formes (relevées sur `0130cc1`, skins v1). Le polygone y figurait en
 * `points` ; il est désormais un chemin — comparé à part, sommet par sommet.
 */
const BEFORE = {
  framePoints:
    '48.00,12.57 114.00,4.19 150.00,16.76 186.00,4.19 252.00,12.57 288.00,46.10 294.00,305.90 270.00,368.76 150.00,419.05 30.00,368.76 6.00,305.90 12.00,46.10',
  surfacePoints:
    '53.71,23.60 116.02,15.69 150.00,27.56 183.98,15.69 246.29,23.60 280.27,55.25 285.94,300.51 263.28,359.84 150.00,407.31 36.72,359.84 14.06,300.51 19.73,55.25',
  skins: {
    gold: { draw: '3d2b129076aa421b', css: 'a0629da8c0da479c' },
    signature: { draw: '926c0beabe0a1130', css: 'b9aa22fce9848908' },
    emerald: { draw: 'c361f38adab4fe09', css: '80a25cee99f8933d' },
    champion: { draw: 'c872fed9ff48a850', css: '74459a65d860f6ea' },
    global: { draw: 'a0b513cd212b04dc', css: 'ece239b93616910f' },
    indomptable: { draw: 'cab1f00537f5cc2e', css: '01bf5d99b81d7a1b' },
    heritage237: { draw: '34ba2b9858f322e7', css: '71759810a5963374' },
    'nuit-douala': { draw: '05f4e0dc862c5ec2', css: 'f4e42a62560a0366' },
  } as Record<string, { draw: string; css: string }>,
};

/**
 * Palettes d'origine des skins RETOUCHÉS depuis ces empreintes (lisibilité,
 * 09/10/2026 — `card-mark.test.ts`) : l'empreinte garde le MOTEUR de rendu,
 * pas la palette. On la recalcule donc sur le spec tel qu'il était en base.
 */
const PALETTE_BEFORE: Record<string, Partial<SkinSpec>> = {
  gold: { surface: surfaceLinear('#e9bc3f', '#c89a28', '#6f5a1c') },
  champion: {
    radials: [
      { color: '#ffcc5c', opacity: 0.5, cx: 0.68, cy: 0.04, r: 0.62 },
      { color: '#ffb020', opacity: 0.18, cx: 0.22, cy: 0.3, r: 0.6 },
    ],
  },
};

const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16);

describe('un skin sans `shape` rend exactement l’ancien résultat', () => {
  test.each(Object.keys(BEFORE.skins).map((k) => [k] as const))('%s', (key) => {
    /* Le spec tel qu'il est stocké en base depuis la v1 : sans `shape`. */
    const stored = JSON.parse(
      JSON.stringify({ ...BUILTIN_SKINS[key as keyof typeof BUILTIN_SKINS], ...PALETTE_BEFORE[key] }),
    );
    expect(stored.shape).toBeUndefined();
    const spec = parseSkinSpec(stored);
    const d = buildSkinDraw(spec, 'fx');

    expect(d.shape).toBe('bouclier');
    expect(d.framePath).toBe(`M${BEFORE.framePoints.split(' ').join('L')}Z`);
    expect(d.surfacePath).toBe(`M${BEFORE.surfacePoints.split(' ').join('L')}Z`);

    const legacy = {
      width: d.width,
      height: d.height,
      frame: d.frame,
      surface: d.surface,
      radials: d.radials,
      stripes: d.stripes,
      clipId: d.clipId,
      inner: d.inner,
      sheen: d.sheen && {
        color: d.sheen.color,
        opacity: d.sheen.opacity,
        top: d.sheen.top,
        height: d.sheen.height,
        width: d.sheen.width,
        skewDeg: d.sheen.skewDeg,
        from: d.sheen.from,
        to: d.sheen.to,
        travelMs: d.sheen.travelMs,
        holdMs: d.sheen.holdMs,
        periodMs: d.sheen.periodMs,
      },
    };
    expect(hash(legacy)).toBe(BEFORE.skins[key].draw);
    /* Positions du contenu web (`--pc-l-*`) et découpe du foil comprises.
       `--pc-band` (bandeau du nom, lot L3) est un AJOUT : il ne change rien
       de ce qui existait, il est donc hors de l'empreinte d'avant. */
    const before = Object.fromEntries(
      Object.entries(skinCssVars(spec)).filter(([name]) => name !== '--pc-band'),
    );
    expect(hash(before)).toBe(BEFORE.skins[key].css);
    if (d.sheen) {
      expect(d.sheen.left).toBe(0);
      expect(d.sheen.boxWidth).toBe(d.width);
    }
  });
});

describe('parseSkinSpec et la version 2', () => {
  const base = JSON.parse(JSON.stringify(BUILTIN_SKINS.signature)) as SkinSpec;

  test('la version courante est 2', () => {
    expect(SKIN_SPEC_VERSION).toBe(2);
  });

  test('un spec v1 sans `shape` reste valide, version conservée', () => {
    const v1 = { ...base, version: 1 };
    const read = parseSkinSpec(v1);
    expect(read.version).toBe(1);
    expect(read.shape).toBeUndefined();
    expect(JSON.stringify(read)).toBe(JSON.stringify(v1));
  });

  test('une forme connue est conservée', () => {
    expect(parseSkinSpec({ ...base, shape: 'ticket' }).shape).toBe('ticket');
    expect(parseSkinSpec({ ...base, shape: 'bouclier' }).shape).toBe('bouclier');
  });

  test.each([['losange'], [''], [42], [null], [{ d: 'M0 0' }], ['HEXA']])(
    'une forme inconnue (%p) retombe sur la forme par défaut',
    (shape) => {
      const read = parseSkinSpec({ ...base, shape });
      expect(read.shape).toBeUndefined();
      expect(cardShape(read.shape).name).toBe(DEFAULT_CARD_SHAPE);
      expect(buildSkinDraw(read, 'x').framePath).toBe(buildSkinDraw(base, 'x').framePath);
    },
  );

  test('l’éditeur assisté porte la forme, sans écrire le défaut', () => {
    const seed = { key: 'essai', label: 'Essai', background: ramp.info[900], frame: ramp.gold[500] };
    expect(skinFromSeed({ ...seed, shape: 'hexa' }).shape).toBe('hexa');
    expect('shape' in skinFromSeed({ ...seed, shape: 'bouclier' })).toBe(false);
    expect('shape' in skinFromSeed(seed)).toBe(false);
    expect(seedFromSkin(skinFromSeed({ ...seed, shape: 'coupe' })).shape).toBe('coupe');
  });
});

describe('le tracé suit la forme', () => {
  test('chemins de la forme, à la taille de référence', () => {
    const d = buildSkinDraw(BUILTIN_SKINS.finale, 'x');
    expect(d.shape).toBe('ticket');
    expect(d.framePath).toBe(CARD_SHAPE_SOURCES.ticket.frame);
    expect(d.surfacePath).toBe(CARD_SHAPE_SOURCES.ticket.surface);
  });

  test('mis à l’échelle à une autre taille de tracé', () => {
    const d = buildSkinDraw(BUILTIN_SKINS['hexa-neon'], 'x', 600, CARD_REF_HEIGHT * 2);
    const b = pathBounds(parsePath(d.framePath));
    expect(b.width).toBeCloseTo(600, 1);
    expect(b.height).toBeCloseTo(CARD_REF_HEIGHT * 2, 0);
  });

  test('le foil court dans la boîte déclarée par la forme', () => {
    const d = buildSkinDraw(BUILTIN_SKINS.finale, 'x');
    const [x, y, w, h] = CARD_SHAPE_SOURCES.ticket.sheen;
    expect(d.sheen!.left).toBeCloseTo(x, 2);
    expect(d.sheen!.boxWidth).toBeCloseTo(w, 2);
    expect(d.sheen!.top).toBeCloseTo((y / H) * CARD_REF_HEIGHT, 2);
    expect(d.sheen!.height).toBeCloseTo((h / H) * CARD_REF_HEIGHT, 2);
    expect(d.sheen!.to).toBeGreaterThan(d.sheen!.boxWidth);
  });

  test('hors bouclier, le web ne découpe plus le foil (boîte inscrite)', () => {
    expect(skinCssVars(BUILTIN_SKINS.blason)['--pc-shape']).toBe('none');
    expect(skinCssVars(BUILTIN_SKINS.signature)['--pc-shape']).toMatch(/^polygon\(/);
  });

  test('la plaque descend dans le V des chevrons', () => {
    const vars = skinCssVars(BUILTIN_SKINS.galons);
    expect(vars['--pc-l-crest-top']).toBe(`${Number(((21 / H) * 100).toFixed(4))}%`);
  });
});

/* -------------------------------------------------------------------------- */
/* Skins de forme : palette de la DA uniquement                               */
/* -------------------------------------------------------------------------- */

const SHAPE_SKINS = BUILTIN_SKIN_KEYS.filter((k) => BUILTIN_SKINS[k].shape);

/** Toutes les couleurs autorisées : rampes + fondation neutre des deux modes. */
const PALETTE = new Set<string>(
  [
    ...Object.values(ramp).flatMap((r) => Object.values(r)),
    ...Object.values(themeColor.light),
    ...Object.values(themeColor.dark),
  ].map((c) => c.toLowerCase()),
);

function hexOf(css: string): string {
  const c = parseColor(css);
  if (!c) throw new Error(`couleur illisible : ${css}`);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

function colorsOf(s: SkinSpec): string[] {
  return [
    s.ink,
    s.line,
    s.accent,
    s.border,
    s.inner,
    ...s.frame.stops.map((x) => x.color),
    ...s.surface.stops.map((x) => x.color),
    ...s.radials.map((r) => r.color),
    ...(s.stripes ? [s.stripes.color, ...(s.stripes.color2 ? [s.stripes.color2] : [])] : []),
    ...(s.sheen ? [s.sheen.color] : []),
    ...(s.glow ? [s.glow.color] : []),
  ];
}

describe('skins de forme', () => {
  test('entre quatre et six, chacun sur une forme différente du bouclier', () => {
    expect(SHAPE_SKINS.length).toBeGreaterThanOrEqual(4);
    expect(SHAPE_SKINS.length).toBeLessThanOrEqual(6);
    const shapes = SHAPE_SKINS.map((k) => BUILTIN_SKINS[k].shape);
    expect(new Set(shapes).size).toBe(shapes.length);
    expect(shapes).not.toContain('bouclier');
  });

  test.each(SHAPE_SKINS.map((k) => [k] as const))('%s : aucune couleur hors rampes', (key) => {
    for (const c of colorsOf(BUILTIN_SKINS[key])) {
      expect(PALETTE.has(hexOf(c))).toBe(true);
    }
  });

  test.each(SHAPE_SKINS.map((k) => [k] as const))('%s : encre lisible sur toute la surface', (key) => {
    const s = BUILTIN_SKINS[key];
    for (const stop of s.surface.stops) {
      expect(contrast(s.ink, stop.color)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test.each(SHAPE_SKINS.map((k) => [k] as const))('%s : aller-retour jsonb à l’identique', (key) => {
    const stored = JSON.parse(JSON.stringify(BUILTIN_SKINS[key]));
    expect(JSON.stringify(parseSkinSpec(stored))).toBe(JSON.stringify(BUILTIN_SKINS[key]));
    expect(stored.version).toBe(2);
  });
});

describe('algèbre de chemins', () => {
  test('lit les drapeaux d’arc collés par SVGO', () => {
    const a = parsePath('M0 0a10 10 0 0 1 20 0');
    const b = parsePath('M0 0a10 10 0 0120 0');
    expect(b).toEqual(a);
    const last = a[a.length - 1];
    expect(last.type === 'C' && last.x).toBeCloseTo(20, 6);
  });

  test('un demi-cercle aplati reste sur son cercle', () => {
    const [poly] = flattenPath(parsePath('M0 0A10 10 0 0 0 20 0'));
    for (const [x, y] of poly) expect(Math.hypot(x - 10, y)).toBeCloseTo(10, 2);
  });
});
