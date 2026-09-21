/**
 * Les initiales sont ce qu'un joueur voit à la place de sa photo tant qu'elle
 * n'est pas approuvée : c'est le cas NORMAL, pas un incident. Une pastille
 * vide, ou deux pastilles identiques dans une même liste, se voient à chaque
 * écran.
 */
import { describe, expect, it } from 'bun:test';

import { initials } from './initials';

describe('initials', () => {
  it('prend la première lettre des deux premiers mots', () => {
    expect(initials('Sopgwi Armel')).toBe('SA');
    expect(initials('Jean Pierre Mbappé')).toBe('JP');
  });

  it('prend les deux premières lettres d’un mot unique', () => {
    expect(initials('mbappe')).toBe('MB');
    expect(initials('Z')).toBe('Z');
  });

  it('traite les séparateurs de pseudo comme des espaces', () => {
    expect(initials('jean_pierre')).toBe('JP');
    expect(initials('kmb-237')).toBe('K2');
    expect(initials('ghub.admin')).toBe('GA');
  });

  it('ignore ce qui n’est ni lettre ni chiffre', () => {
    expect(initials('🔥kmb')).toBe('KM');
    expect(initials('  ***  ')).toBe('?');
    expect(initials('')).toBe('?');
  });

  it('rend « ? » plutôt qu’une pastille muette', () => {
    expect(initials(null)).toBe('?');
    expect(initials(undefined)).toBe('?');
  });

  it('garde les accents', () => {
    expect(initials('Émile')).toBe('ÉM');
  });
});
