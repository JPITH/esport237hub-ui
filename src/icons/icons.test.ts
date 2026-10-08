/**
 * Le jeu d'icônes G-HUB tient sa grammaire (README.md de ce dossier) :
 * un SVG par nom, grille 24, encre `currentColor` seulement, aucun raster,
 * un poids total borné — et des fichiers générés à jour.
 */
import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { build, parseGlyph } from '../../scripts/icons';
import { ICON_GLYPHS } from './generated/data';
import { ICON_NAMES } from './names';

const SVG_DIR = join(import.meta.dir, 'svg');
const files = readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg'));
const read = (name: string) => readFileSync(join(SVG_DIR, `${name}.svg`), 'utf8');

/** Parcourt un tracé fait de segments (M L H V Z, absolus ou relatifs). */
function points(d: string): [number, number][] {
  const out: [number, number][] = [];
  const tokens = d.match(/[MLHVZmlhvz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cmd = 'M';
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i]!)) cmd = tokens[i++]!;
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case 'M':
      case 'L': {
        const a = num();
        const b = num();
        x = rel ? x + a : a;
        y = rel ? y + b : b;
        if (cmd.toUpperCase() === 'M') {
          sx = x;
          sy = y;
          cmd = rel ? 'l' : 'L'; // coordonnées suivantes = lignes implicites
        }
        break;
      }
      case 'H':
        x = rel ? x + num() : num();
        break;
      case 'V':
        y = rel ? y + num() : num();
        break;
      case 'Z':
        x = sx;
        y = sy;
        continue;
    }
    out.push([x, y]);
  }
  return out;
}

/** Budget du jeu complet, sources optimisées comprises. */
const TOTAL_BUDGET = 48 * 1024;

describe('jeu d’icônes G-HUB', () => {
  test('chaque nom a son SVG, et chaque SVG a son nom', () => {
    expect(files.map((f) => f.slice(0, -4)).sort()).toEqual([...ICON_NAMES]);
    expect(Object.keys(ICON_GLYPHS).sort()).toEqual([...ICON_NAMES]);
  });

  test('au moins soixante icônes, en kebab-case', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(60);
    for (const n of ICON_NAMES) expect(n).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  for (const name of ICON_NAMES) {
    test(`${name} : grille 24, encre héritée, tracés seulement`, () => {
      const svg = read(name);
      expect(svg).toContain('viewBox="0 0 24 24"');
      // Aucune dimension fixe : la taille est celle du composant.
      expect(svg).not.toMatch(/<svg[^>]*\s(width|height)=/);
      // Aucune couleur en dur : ni hex, ni rgb/hsl, ni nom de couleur.
      expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(svg).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch)\(/i);
      for (const m of svg.matchAll(/\b(fill|stroke|color|stop-color)="([^"]*)"/g)) {
        expect(['currentColor', 'none']).toContain(m[2]!);
      }
      // Aucun raster, aucun lien externe, aucun style embarqué.
      expect(svg).not.toMatch(/<(image|use|style|script|foreignObject)\b/);
      expect(svg).not.toMatch(/data:|href=/);
      // La grammaire complète (attributs racine, couches) est celle du générateur.
      expect(() => parseGlyph(name, svg.trim())).not.toThrow();
    });
  }

  test('les tracés sont des droites (chanfreins, pas de courbes) et restent dans la zone utile', () => {
    for (const name of ICON_NAMES) {
      const g = ICON_GLYPHS[name];
      for (const d of [...(g.s ?? []), ...(g.f ?? []), ...(g.a ?? [])]) {
        // Le jeu ne dessine qu'avec des segments : M, L, H, V, Z.
        expect({ name, d: d.replace(/[MLHVZmlhvz\d\s.,-]/g, '') }).toEqual({ name, d: '' });
        for (const [x, y] of points(d)) {
          // Axe du trait dans 1,5 → 22,5 : avec la demi-épaisseur (0,875),
          // l'encre tient dans la grille de 24 et déborde au plus d'un
          // demi-point de la zone utile 2 → 22.
          expect({ name, x: x >= 1.5 && x <= 22.5, y: y >= 1.5 && y <= 22.5 }).toEqual({ name, x: true, y: true });
        }
      }
    }
  });

  test(`poids total sous ${TOTAL_BUDGET / 1024} Ko`, () => {
    const total = files.reduce((s, f) => s + statSync(join(SVG_DIR, f)).size, 0);
    expect(total).toBeLessThan(TOTAL_BUDGET);
  });

  test('sources optimisées et fichiers générés à jour (bun scripts/icons.ts)', () => {
    const { sources, files: generated } = build();
    for (const [name, s] of sources) expect({ name, svg: s.before }).toEqual({ name, svg: s.after });
    for (const [path, content] of generated) expect(readFileSync(path, 'utf8')).toBe(content);
  });
});
