import { describe, expect, it } from 'bun:test';

import { MIN_TOUCH, touchTargetBox } from './touch-target';

describe('touchTargetBox — une zone de 44 px sans rien déplacer', () => {
  it('agrandit un visuel de 32 px à 44 px et rend la place par une marge négative', () => {
    const box = touchTargetBox(32);
    expect(box.minWidth).toBe(MIN_TOUCH);
    expect(box.minHeight).toBe(MIN_TOUCH);
    expect(box.marginHorizontal).toBe(-6);
    expect(box.marginVertical).toBe(-6);
    // L'emprise dans la mise en page reste celle du visuel.
    expect((box.minWidth as number) + 2 * (box.marginHorizontal as number)).toBe(32);
  });

  it('traite largeur et hauteur séparément (interrupteur 36 × 22)', () => {
    const box = touchTargetBox(36, 22);
    expect(box.marginHorizontal).toBe(-4);
    expect(box.marginVertical).toBe(-11);
  });

  it('ne touche pas un visuel déjà assez grand', () => {
    expect(touchTargetBox(44)).toEqual({});
    expect(touchTargetBox(48, 52)).toEqual({});
  });

  it('n’élargit que l’axe trop petit', () => {
    const box = touchTargetBox(80, 34);
    expect(box.marginHorizontal).toBe(0);
    expect(box.minWidth).toBe(80);
    expect(box.marginVertical).toBe(-5);
  });
});
