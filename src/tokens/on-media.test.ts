import { describe, expect, it } from 'bun:test';

import { onMedia } from './index';
import { contrast } from './oklch';

/** Composite d'un voile `#rrggbb` à `alpha` sur un fond `#rrggbb`. */
function over(top: string, alpha: number, bottom: string): string {
  const ch = (hex: string, i: number) => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const mix = [0, 1, 2].map((i) => Math.round(ch(top, i) * alpha + ch(bottom, i) * (1 - alpha)));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * La pastille « sur image » (`Badge variant="on-media"`) doit rester lisible
 * sur N'IMPORTE quelle photo : le pire cas est une image blanche sous le
 * voile, le meilleur une image noire. AA (4.5:1) dans les deux cas.
 */
describe('onMedia — la pastille posée sur une image', () => {
  it('tient le AA sur une image blanche (pire cas)', () => {
    const backdrop = over(onMedia.scrim, onMedia.scrimAlpha, '#ffffff');
    expect(contrast(onMedia.ink, backdrop)).toBeGreaterThanOrEqual(4.5);
  });

  it('tient le AA sur une image noire', () => {
    const backdrop = over(onMedia.scrim, onMedia.scrimAlpha, '#000000');
    expect(contrast(onMedia.ink, backdrop)).toBeGreaterThanOrEqual(4.5);
  });
});
