import { describe, expect, it } from 'bun:test';

import { carouselIndexAt, nextCarouselIndex } from './carousel-model';

describe('nextCarouselIndex — le défilement automatique boucle', () => {
  it('avance, puis revient au premier', () => {
    expect(nextCarouselIndex(0, 3)).toBe(1);
    expect(nextCarouselIndex(2, 3)).toBe(0);
  });

  it('un seul élément ne bouge pas', () => {
    expect(nextCarouselIndex(0, 1)).toBe(0);
    expect(nextCarouselIndex(0, 0)).toBe(0);
  });
});

describe('carouselIndexAt — l’élément calé à l’écran', () => {
  it('suit le pas de calage', () => {
    expect(carouselIndexAt(0, 300, 4)).toBe(0);
    expect(carouselIndexAt(310, 300, 4)).toBe(1);
    expect(carouselIndexAt(890, 300, 4)).toBe(3);
  });

  it('ne sort jamais de la liste (rebond négatif, fin de piste)', () => {
    expect(carouselIndexAt(-40, 300, 4)).toBe(0);
    expect(carouselIndexAt(5000, 300, 4)).toBe(3);
  });

  it('tolère une largeur pas encore mesurée', () => {
    expect(carouselIndexAt(120, 0, 4)).toBe(0);
    expect(carouselIndexAt(120, 300, 0)).toBe(0);
  });
});
