/**
 * Le socle des skins est la source de vérité du rendu des cartes sur les trois
 * plateformes : toute régression ici casse le web ET le mobile. Lancer avec
 * `bun test` depuis packages/ui.
 */
import { describe, expect, test } from 'bun:test';

import {
  CARD_LAYOUT,
  FLAG_RADIUS,
  cardLayoutCssVars,
  pct,
  BUILTIN_SKINS,
  BUILTIN_SKIN_KEYS,
  buildSkinDraw,
  cardScale,
  parseSkinSpec,
  resolveSkin,
  seedFromSkin,
  shapePoints,
  skinAnimated,
  skinCssVars,
  skinFromLegacyDesign,
  skinFromSeed,
} from './index';

describe('skins intégrés', () => {
  test.each(BUILTIN_SKIN_KEYS.map((k) => [k] as const))('%s est complet', (key) => {
    const s = BUILTIN_SKINS[key];
    expect(s.key).toBe(key);
    expect(s.label.length).toBeGreaterThan(0);
    expect(s.frame.stops).toHaveLength(3);
    expect(s.surface.stops).toHaveLength(3);
    expect(s.ink).toMatch(/^#|^rgb/);
  });

  test('les skins vendables ont foil et halo', () => {
    const premium = BUILTIN_SKIN_KEYS.filter((k) => BUILTIN_SKINS[k].premium);
    expect(premium).toEqual(['indomptable', 'heritage237', 'nuit-douala']);
    for (const k of premium) {
      expect(BUILTIN_SKINS[k].sheen).toBeDefined();
      expect(BUILTIN_SKINS[k].glow).toBeDefined();
    }
  });
});

describe('aller-retour jsonb', () => {
  test.each(BUILTIN_SKIN_KEYS.map((k) => [k] as const))('%s resérialise à l’identique', (key) => {
    const stored = JSON.parse(JSON.stringify(BUILTIN_SKINS[key]));
    const read = parseSkinSpec(stored);
    expect(read).toEqual(BUILTIN_SKINS[key]);
    /* Ordre des clés stable → pas de faux diff en base. */
    expect(JSON.stringify(read)).toBe(JSON.stringify(BUILTIN_SKINS[key]));
  });
});

describe('lecture tolérante', () => {
  /* Un design corrompu en base ne doit JAMAIS faire planter l'app mobile :
     c'était le bug d'origine (`CARD_SKINS[cléInconnue]` → undefined → crash). */
  const hostile: unknown[] = [
    null,
    undefined,
    0,
    '',
    '   ',
    'skin-inexistant',
    [],
    {},
    { frame: 'nawak' },
    { frame: { stops: [] }, surface: null },
    { version: 99, key: 'futur', frame: { stops: [{ color: '#fff' }] } },
    { design: { nested: true } },
  ];

  test.each(hostile.map((v) => [JSON.stringify(v) ?? 'undefined', v] as const))(
    'parseSkinSpec(%s) rend un spec rendable',
    (_label, value) => {
      const s = parseSkinSpec(value);
      expect(s.frame.stops.length).toBeGreaterThanOrEqual(2);
      expect(s.surface.stops.length).toBeGreaterThanOrEqual(2);
      expect(s.ink).toBeTruthy();
      expect(s.border).toBeTruthy();
    },
  );

  test('une clé intégrée passée en chaîne résout le bon skin', () => {
    expect(parseSkinSpec('champion').key).toBe('champion');
  });

  test('une clé inconnue retombe sur le défaut au lieu de casser', () => {
    expect(resolveSkin('skin-boutique-supprime').key).toBe('signature');
    expect(resolveSkin(null).key).toBe('signature');
  });

  test('le catalogue dynamique prime sur les skins intégrés', () => {
    const custom = skinFromSeed({
      key: 'signature',
      label: 'Signature revisitée',
      background: '#101820',
      frame: '#c0a062',
    });
    expect(resolveSkin('signature', { signature: custom }).label).toBe('Signature revisitée');
  });
});

describe('migration des anciens design --pc-*', () => {
  /* Format écrit par l'éditeur de skins avant l'unification. */
  const legacy = {
    '--pc-ink': '#eaf2ff',
    '--pc-frame1': '#1b3a63',
    '--pc-frame2': '#0d1f38',
    '--pc-bg1': '#163a5a',
    '--pc-bg2': '#12294a',
    '--pc-accent': '#22c55e',
    '--pc-sheenc': '#ffffff',
    '--pc-glowc': '#22c55e',
    premium: true,
  };

  test('les couleurs saisies par l’admin sont conservées', () => {
    const s = skinFromLegacyDesign(legacy, 'ancien', 'Ancien');
    expect(s.surface.stops[0].color).toBe('#12294a');
    expect(s.frame.stops[1].color).toBe('#1b3a63');
    expect(s.frame.stops[2].color).toBe('#0d1f38');
    expect(s.radials[0].color).toBe('#163a5a');
    expect(s.ink).toBe('#eaf2ff');
    expect(s.accent).toBe('#22c55e');
  });

  test('premium restitue foil et halo', () => {
    const s = skinFromLegacyDesign(legacy, 'ancien');
    expect(s.sheen?.color).toBe('#ffffff');
    expect(s.glow).toBeDefined();
  });

  test('parseSkinSpec reconnaît le format legacy tout seul', () => {
    expect(parseSkinSpec(legacy, { key: 'ancien' }).key).toBe('ancien');
  });
});

describe('création assistée', () => {
  test('deux couleurs suffisent à produire un skin complet', () => {
    const s = skinFromSeed({ key: 'nouveau', label: 'Nouveau', background: '#101820', frame: '#c0a062' });
    expect(s.frame.stops).toHaveLength(3);
    expect(s.surface.stops).toHaveLength(3);
    expect(s.sheen).toBeUndefined();
  });

  test('l’encre est choisie pour rester lisible', () => {
    expect(skinFromSeed({ key: 'a', label: 'A', background: '#101820', frame: '#888' }).ink).toBe(
      '#f4f8ff',
    );
    expect(skinFromSeed({ key: 'b', label: 'B', background: '#f3e9c8', frame: '#888' }).ink).toBe(
      '#1b1205',
    );
  });

  test('un skin se réouvre à l’édition sans perte', () => {
    const seed = { key: 'c', label: 'C', background: '#101820', frame: '#c0a062', premium: true };
    const back = seedFromSkin(skinFromSeed(seed));
    expect(back.background).toBe(seed.background);
    expect(back.frame).toBe(seed.frame);
    expect(back.premium).toBe(true);
  });
});

describe('géométrie du bouclier', () => {
  test('les sommets sont homothétiques (parité entre tailles de rendu)', () => {
    const [x1, y1] = shapePoints(300, 419).split(' ')[0].split(',').map(Number);
    const [x2, y2] = shapePoints(600, 838).split(' ')[0].split(',').map(Number);
    expect(x2 / x1).toBeCloseTo(2, 2);
    expect(y2 / y1).toBeCloseTo(2, 2);
  });

  test('12 sommets, et la surface est en retrait du liseré', () => {
    expect(shapePoints(300, 419).split(' ')).toHaveLength(12);
    const frameX = Number(shapePoints(300, 419).split(',')[0]);
    const surfaceX = Number(shapePoints(300, 419, 0.056).split(',')[0]);
    expect(surfaceX).toBeGreaterThan(frameX);
  });

  test('l’échelle typographique est bornée', () => {
    expect(cardScale(300)).toBe(1);
    expect(cardScale(50)).toBe(0.5);
    expect(cardScale(10000)).toBe(1.2);
  });
});

describe('liste de tracé', () => {
  test('les identifiants sont préfixés (plusieurs cartes dans un document)', () => {
    const a = buildSkinDraw(BUILTIN_SKINS.champion, 'ca');
    const b = buildSkinDraw(BUILTIN_SKINS.champion, 'cb');
    expect(a.frame.id).not.toBe(b.frame.id);
    expect(a.clipId).toBe('ca-clip');
  });

  test('scanlines horizontales', () => {
    const d = buildSkinDraw(BUILTIN_SKINS['nuit-douala'], 'x');
    expect(d.stripes.length).toBeGreaterThan(30);
    expect(d.stripes.every((l) => l.y1 === l.y2)).toBe(true);
  });

  test('chevrons toghu : deux couleurs croisées', () => {
    const d = buildSkinDraw(BUILTIN_SKINS.heritage237, 'x');
    expect(new Set(d.stripes.map((l) => l.color)).size).toBe(2);
  });

  test('un skin sobre ne génère ni rayure ni foil', () => {
    const d = buildSkinDraw(BUILTIN_SKINS.gold, 'x');
    expect(d.stripes).toHaveLength(0);
    expect(d.sheen).toBeUndefined();
  });

  test('la densité du motif ne dépend pas de la taille de rendu', () => {
    /* Le web affiche des cartes de 420 px, le mobile de 220 px : sans motif
       relatif, les rayures seraient deux fois plus serrées d'un côté. */
    const small = buildSkinDraw(BUILTIN_SKINS['nuit-douala'], 'a', 220, 307);
    const big = buildSkinDraw(BUILTIN_SKINS['nuit-douala'], 'b', 440, 614);
    expect(Math.abs(small.stripes.length - big.stripes.length)).toBeLessThanOrEqual(1);
  });

  test('le foil décrit un cycle complet', () => {
    const d = buildSkinDraw(BUILTIN_SKINS.indomptable, 'x');
    expect(d.sheen).toBeDefined();
    expect(d.sheen!.periodMs).toBe(d.sheen!.travelMs + d.sheen!.holdMs);
    expect(d.sheen!.from).toBeLessThan(0);
    expect(d.sheen!.to).toBeGreaterThan(300);
  });
});

describe('effets animés', () => {
  test('seuls les skins premium s’animent, sauf forçage par l’éditeur', () => {
    expect(skinAnimated(BUILTIN_SKINS.indomptable)).toBe(true);
    expect(skinAnimated(BUILTIN_SKINS.signature)).toBe(false);
    expect(skinAnimated(BUILTIN_SKINS.champion, true)).toBe(true);
  });
});

describe('variables CSS', () => {
  test('dérivées du spec, jamais écrites à la main', () => {
    const vars = skinCssVars(BUILTIN_SKINS.champion);
    expect(vars['--pc-ink']).toBe(BUILTIN_SKINS.champion.ink);
    expect(vars['--pc-glowc']).toBe(BUILTIN_SKINS.champion.glow!.color);
  });
});

describe('gabarit du contenu', () => {
  /* Le natif plaçait le badge à ~6,7 % (padding fixe de 20 px) là où le web le
     place à 12 % : l'OVR chevauchait le liseré. Un seul jeu de fractions
     alimente désormais les deux plateformes — ces tests l'y maintiennent. */
  test('tous les blocs restent dans la carte', () => {
    for (const [nom, box] of Object.entries(CARD_LAYOUT)) {
      for (const [cote, valeur] of Object.entries(box)) {
        expect(valeur).toBeGreaterThan(0);
        expect(valeur).toBeLessThanOrEqual(1);
      }
      const b = box as Record<string, number>;
      if (b.left !== undefined && b.width !== undefined) {
        // Bord droit du bloc — jamais hors carte.
        expect(b.left + b.width).toBeLessThanOrEqual(1);
      }
      if (b.top !== undefined && b.height !== undefined) {
        expect(b.top + b.height).toBeLessThanOrEqual(1);
      }
      expect(nom.length).toBeGreaterThan(0);
    }
  });

  test('la colonne badge est bien en retrait du liseré', () => {
    /* Le bouclier atteint x = 0.02 au plus large ; un badge à 12 % laisse donc
       10 points de marge, contre 4,7 avec l'ancien padding de 20 px. */
    expect(CARD_LAYOUT.badge.left).toBeGreaterThan(0.1);
  });

  test('pct produit une valeur exploitable par React Native', () => {
    expect(pct(0.125)).toBe('12.5%');
    expect(pct(0.7)).toBe('70%');
    expect(pct(0.012)).toBe('1.2%');
  });

  test('les variables CSS couvrent tout le gabarit', () => {
    const vars = cardLayoutCssVars();
    expect(vars['--pc-l-badge-left']).toBe('12%');
    expect(vars['--pc-l-stats-width']).toBe('70%');
    expect(vars['--pc-l-footer-bottom']).toBe('6.8%');
    // Seul habillage conservé par le drapeau : l'arrondi.
    expect(vars['--pc-l-flag-radius']).toBe(`${FLAG_RADIUS}px`);
    // Une variable par côté de chaque bloc, sans trou, plus l'arrondi.
    const attendu = Object.values(CARD_LAYOUT).reduce((n, b) => n + Object.keys(b).length, 0);
    expect(Object.keys(vars)).toHaveLength(attendu + 1);
  });
});
