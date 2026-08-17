import { describe, expect, it } from 'bun:test';

import { hasLocalVariants } from './picture';

/**
 * L'enjeu de ces tests n'est pas cosmétique.
 *
 * `<picture>` ne se rabat pas sur un 404 : le navigateur retient la première
 * `<source>` dont il sait décoder le type et s'y tient. Décliner un chemin dont
 * les variantes AVIF/WebP n'existent pas ne dégrade donc pas l'affichage — il
 * le casse, silencieusement, et seulement chez les utilisateurs dont le
 * navigateur supporte AVIF (donc la majorité, et pas nous en développement si
 * on teste sur un vieux navigateur).
 *
 * Le cas le plus dangereux est une URL de stockage Supabase qui finit en
 * `.png` : avatars, preuves de duel, visuels d'événement. Un `endsWith('.png')`
 * naïf les aurait toutes converties en images cassées.
 */
describe('hasLocalVariants', () => {
  it('décline les visuels de public/ convertis par le script', () => {
    for (const src of [
      '/cards/player-fallback.png',
      '/brand/auth-bg.png',
      '/media/game-fc27.png',
      '/media/hero-valorant.PNG',
      '/media/photo.jpg',
      '/media/photo.jpeg',
      '/media/photo.JPG',
    ]) {
      expect(hasLocalVariants(src)).toBe(true);
    }
  });

  it('ne décline JAMAIS une URL distante, même en .png', () => {
    for (const src of [
      'https://abcdef.supabase.co/storage/v1/object/public/avatars/moi.png',
      'http://exemple.cm/x.jpg',
      '//cdn.exemple.cm/x.png',
      'blob:https://localhost/8f2c-4a1e',
      'data:image/png;base64,iVBORw0KGgo=',
    ]) {
      expect(hasLocalVariants(src)).toBe(false);
    }
  });

  it('ne décline pas un format que le script ne convertit pas', () => {
    for (const src of ['/brand/logo.svg', '/media/anim.gif', '/media/x.webp', '/media/x.avif']) {
      expect(hasLocalVariants(src)).toBe(false);
    }
  });

  it('ne décline pas un chemin relatif — la racine du site n’est pas garantie', () => {
    // `media/x.png` se résout selon l'URL courante : sur /salles/42 il pointe
    // vers /salles/media/x.png. Les variantes n'y sont pas.
    expect(hasLocalVariants('media/x.png')).toBe(false);
    expect(hasLocalVariants('./media/x.png')).toBe(false);
    expect(hasLocalVariants('../media/x.png')).toBe(false);
  });
});
