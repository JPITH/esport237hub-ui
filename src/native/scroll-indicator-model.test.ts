import { describe, expect, it } from 'bun:test';

import {
  THUMB_MIN,
  THUMB_SQUISH_MIN,
  scrollThumb,
  splitScrollStyle,
  thumbTimings,
} from './scroll-indicator-model';

/** Un écran de téléphone : 600 pt visibles. */
const VIEW = 600;

describe('scrollThumb — taille', () => {
  it('rien à montrer quand le contenu tient dans la vue', () => {
    expect(scrollThumb({ viewport: VIEW, content: VIEW, offset: 0 }).scrollable).toBe(false);
    expect(scrollThumb({ viewport: VIEW, content: 300, offset: 0 }).scrollable).toBe(false);
    // Un demi-point de trop (arrondi de mise en page) ne fait pas une liste.
    expect(scrollThumb({ viewport: VIEW, content: VIEW + 0.5, offset: 0 }).scrollable).toBe(false);
  });

  it('rien à montrer tant que la vue n’est pas mesurée', () => {
    expect(scrollThumb({ viewport: 0, content: 2000, offset: 0 }).scrollable).toBe(false);
  });

  it('suit la part visible du contenu', () => {
    // Deux écrans de contenu : le curseur fait la moitié de la piste.
    expect(scrollThumb({ viewport: VIEW, content: 2 * VIEW, offset: 0 }).size).toBe(VIEW / 2);
    // Quatre écrans : le quart.
    expect(scrollThumb({ viewport: VIEW, content: 4 * VIEW, offset: 0 }).size).toBe(VIEW / 4);
  });

  it('ne descend jamais sous le plancher, même sur un très long fil', () => {
    const thumb = scrollThumb({ viewport: VIEW, content: 300 * VIEW, offset: 0 });
    expect(thumb.size).toBe(THUMB_MIN);
  });

  it('le plancher ne dépasse pas une piste trop courte', () => {
    const thumb = scrollThumb({ viewport: 30, content: 3000, offset: 0 });
    expect(thumb.size).toBe(30);
    expect(thumb.position).toBe(0);
  });

  it('se mesure sur la piste, marges retirées', () => {
    const thumb = scrollThumb({
      viewport: VIEW,
      content: 2 * VIEW,
      offset: 0,
      insetStart: 40,
      insetEnd: 60,
    });
    expect(thumb.size).toBe((VIEW - 100) / 2);
    expect(thumb.position).toBe(40);
  });
});

describe('scrollThumb — position', () => {
  const base = { viewport: VIEW, content: 3 * VIEW };

  it('en haut au départ, en bas à la fin, au milieu à mi-course', () => {
    const size = VIEW / 3;
    expect(scrollThumb({ ...base, offset: 0 }).position).toBe(0);
    expect(scrollThumb({ ...base, offset: 2 * VIEW }).position).toBe(VIEW - size);
    expect(scrollThumb({ ...base, offset: VIEW }).position).toBeCloseTo((VIEW - size) / 2, 6);
  });

  it('reste dans la piste, marges comprises, à la fin du contenu', () => {
    const thumb = scrollThumb({ ...base, offset: 2 * VIEW, insetStart: 10, insetEnd: 90 });
    expect(thumb.position + thumb.size).toBeCloseTo(VIEW - 90, 6);
  });

  it('une liste inversée part du bas', () => {
    const size = VIEW / 3;
    expect(scrollThumb({ ...base, offset: 0, inverted: true }).position).toBe(VIEW - size);
    expect(scrollThumb({ ...base, offset: 2 * VIEW, inverted: true }).position).toBe(0);
  });
});

describe('scrollThumb — rebond iOS', () => {
  const base = { viewport: VIEW, content: 2 * VIEW };

  it('tiré au-delà du haut : collé en haut, raccourci de la distance tirée', () => {
    const thumb = scrollThumb({ ...base, offset: -50 });
    expect(thumb.position).toBe(0);
    expect(thumb.size).toBe(VIEW / 2 - 50);
  });

  it('tiré au-delà du bas : collé en bas, raccourci aussi', () => {
    const thumb = scrollThumb({ ...base, offset: VIEW + 80 });
    expect(thumb.size).toBe(VIEW / 2 - 80);
    expect(thumb.position + thumb.size).toBe(VIEW);
  });

  it('ne disparaît pas sous un rebond démesuré', () => {
    expect(scrollThumb({ ...base, offset: -5000 }).size).toBe(THUMB_SQUISH_MIN);
  });
});

describe('thumbTimings', () => {
  it('sans fondu en « réduire les animations », mais le temps de lire reste', () => {
    const reduced = thumbTimings(true);
    expect(reduced.fadeIn).toBe(0);
    expect(reduced.fadeOut).toBe(0);
    expect(reduced.hold).toBeGreaterThan(0);
  });

  it('un fondu court à l’entrée, plus doux à la sortie', () => {
    const full = thumbTimings(false);
    expect(full.fadeIn).toBeGreaterThan(0);
    expect(full.fadeOut).toBeGreaterThan(full.fadeIn);
  });
});

describe('splitScrollStyle', () => {
  it('sans style : les deux gardent le flex par défaut d’une ScrollView', () => {
    expect(splitScrollStyle(undefined)).toEqual({
      outer: { flexGrow: 1, flexShrink: 1 },
      inner: { flexGrow: 1, flexShrink: 1 },
    });
  });

  it('la place dans le parent va à l’enveloppe, l’apparence reste sur la vue', () => {
    const { outer, inner } = splitScrollStyle({
      maxHeight: 260,
      marginTop: 8,
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      borderRadius: 16,
    });
    expect(outer).toEqual({ flexGrow: 1, flexShrink: 1, maxHeight: 260, marginTop: 8 });
    expect(inner).toEqual({
      flexGrow: 1,
      flexShrink: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      borderRadius: 16,
    });
  });

  it('`flex: 1` n’est pas contredit par les défauts', () => {
    const { outer } = splitScrollStyle({ flex: 1 });
    expect(outer).toEqual({ flex: 1 });
  });

  it('un flexGrow explicite l’emporte sur le défaut', () => {
    expect(splitScrollStyle({ flexGrow: 0 }).outer).toEqual({ flexGrow: 0, flexShrink: 1 });
  });
});
