import { describe, expect, it } from 'bun:test';

import { DISMISS_DISTANCE, FLICK, decideSnap } from './sheet-snap';

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
