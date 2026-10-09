import { describe, expect, it } from 'bun:test';

import {
  DISMISS_DISTANCE,
  FLICK,
  SHEET_EXPANDED_HEIGHT,
  SHEET_MAX_HEIGHT,
  decideSnap,
  sheetCaps,
} from './sheet-snap';

/** Place typique restant à gagner en hauteur sur un téléphone. */
const ROOM = 400;

describe('decideSnap', () => {
  it('sans vitesse, tranche à la moitié du chemin', () => {
    expect(decideSnap(ROOM * 0.4, 0, ROOM)).toEqual({ close: false, to: 0 });
    expect(decideSnap(ROOM * 0.6, 0, ROOM)).toEqual({ close: false, to: ROOM });
  });

  it('un geste franc vers le haut agrandit, même à mi-chemin descendant', () => {
    expect(decideSnap(10, -FLICK - 1, ROOM)).toEqual({ close: false, to: ROOM });
  });

  it('un geste franc vers le bas réduit d’abord, ferme ensuite', () => {
    // Depuis le plein écran : on redescend d'un cran.
    expect(decideSnap(ROOM, FLICK + 1, ROOM)).toEqual({ close: false, to: 0 });
    // Depuis la position basse : on s'en va.
    expect(decideSnap(0, FLICK + 1, ROOM)).toEqual({ close: true });
  });

  it('ferme sur la distance seule, sans vitesse', () => {
    expect(decideSnap(-DISMISS_DISTANCE - 1, 0, ROOM)).toEqual({ close: true });
    // Juste au-dessus du seuil : on revient en place plutôt que de disparaître.
    expect(decideSnap(-DISMISS_DISTANCE + 1, 0, ROOM)).toEqual({ close: false, to: 0 });
  });

  it('sans place à gagner (contenu déjà plein écran), ne fait que revenir ou fermer', () => {
    expect(decideSnap(0, 0, 0)).toEqual({ close: false, to: 0 });
    expect(decideSnap(-DISMISS_DISTANCE - 1, 0, 0)).toEqual({ close: true });
  });
});

describe('sheetCaps', () => {
  const H = 800;

  it('par défaut : 88 % au repos, 92 % agrandie', () => {
    expect(sheetCaps(H)).toEqual({
      collapsedMax: Math.round(H * SHEET_MAX_HEIGHT),
      expandedMax: Math.round(H * SHEET_EXPANDED_HEIGHT),
    });
  });

  it('une conversation plafonne plus bas, sans changer la position agrandie', () => {
    expect(sheetCaps(H, 0.8)).toEqual({ collapsedMax: 640, expandedMax: 736 });
  });

  it('un plafond absurde est borné : jamais au-delà de la position agrandie, jamais sans corps', () => {
    expect(sheetCaps(H, 1.5).collapsedMax).toBe(736);
    expect(sheetCaps(H, 0.05).collapsedMax).toBe(320);
    expect(sheetCaps(H, Number.NaN).collapsedMax).toBe(Math.round(H * SHEET_MAX_HEIGHT));
  });
});
