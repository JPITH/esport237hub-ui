/**
 * Le formatage des montants touche à l'argent : il se vérifie.
 *
 * En particulier la frontière entre forme exacte et forme abrégée — c'est
 * elle qui décide si un chiffre déborde d'une carte, et elle qui garantit
 * qu'un écran de retrait n'affiche jamais un montant arrondi.
 */
import { describe, expect, it } from 'bun:test';

import { formatXaf, formatXafCompact, priceOrFreeLabel } from './money';

/** Espace fine insécable (milliers) et espace insécable (unité). */
const THIN = String.fromCharCode(0x202f);
const NBSP = String.fromCharCode(0x00a0);

describe('formatXaf — forme exacte', () => {
  it('groupe les milliers et colle l’unité', () => {
    expect(formatXaf(2000)).toBe(`2${THIN}000${NBSP}FCFA`);
    expect(formatXaf(187_500)).toBe(`187${THIN}500${NBSP}FCFA`);
  });

  it('tolère null, undefined et NaN', () => {
    expect(formatXaf(null)).toBe(`0${NBSP}FCFA`);
    expect(formatXaf(undefined)).toBe(`0${NBSP}FCFA`);
    expect(formatXaf(Number.NaN)).toBe(`0${NBSP}FCFA`);
  });

  it('garde le signe négatif', () => {
    expect(formatXaf(-1500)).toBe(`-1${THIN}500${NBSP}FCFA`);
  });
});

describe('formatXafCompact — forme abrégée', () => {
  it('laisse les montants à cinq chiffres en entier', () => {
    // Contre-intuitif mais mesurable : « 47,5 k FCFA » est PLUS LONG que
    // « 47 500 FCFA ». L'abréviation ne gagne de la place qu'à six chiffres.
    expect(formatXafCompact(500)).toBe(`500${NBSP}FCFA`);
    expect(formatXafCompact(47_500)).toBe(`47${THIN}500${NBSP}FCFA`);
    expect(formatXafCompact(99_999)).toBe(`99${THIN}999${NBSP}FCFA`);
  });

  it('abrège en milliers à partir de six chiffres', () => {
    expect(formatXafCompact(100_000)).toBe(`100${NBSP}k${NBSP}FCFA`);
    expect(formatXafCompact(187_500)).toBe(`188${NBSP}k${NBSP}FCFA`);
    expect(formatXafCompact(486_000)).toBe(`486${NBSP}k${NBSP}FCFA`);
  });

  it('abrège en millions', () => {
    expect(formatXafCompact(2_450_000)).toBe(`2,5${NBSP}M${NBSP}FCFA`);
    expect(formatXafCompact(12_400_000)).toBe(`12,4${NBSP}M${NBSP}FCFA`);
  });

  it('utilise la virgule décimale française', () => {
    expect(formatXafCompact(1_500_000)).toContain(',');
    expect(formatXafCompact(1_500_000)).not.toContain('.');
  });

  it('garde le signe négatif', () => {
    expect(formatXafCompact(-187_500)).toBe(`-188${NBSP}k${NBSP}FCFA`);
  });

  it('accepte un seuil personnalisé', () => {
    expect(formatXafCompact(5_000, { from: 1_000 })).toBe(`5${NBSP}k${NBSP}FCFA`);
  });

  it('n’est JAMAIS plus long que la forme exacte', () => {
    // L'invariante qui justifie le seuil : abréger doit toujours faire gagner
    // de la place, sinon on a perdu de la précision pour rien.
    // `Math.max(… + 1, …)` : sans lui, `Math.round(1 * 1.37)` vaut 1 et la
    // boucle ne progresse jamais.
    for (
      let amount = 1;
      amount < 50_000_000;
      amount = Math.max(amount + 1, Math.round(amount * 1.37))
    ) {
      expect(
        formatXafCompact(amount).length,
        `${amount} → ${formatXafCompact(amount)} vs ${formatXaf(amount)}`,
      ).toBeLessThanOrEqual(formatXaf(amount).length);
    }
  });

  it('raccourcit réellement dès six chiffres', () => {
    for (const amount of [100_000, 187_500, 2_450_000, 12_400_000]) {
      expect(formatXafCompact(amount).length).toBeLessThan(
        formatXaf(amount).length,
      );
    }
  });

  it('tolère null et NaN', () => {
    expect(formatXafCompact(null)).toBe(`0${NBSP}FCFA`);
    expect(formatXafCompact(Number.NaN)).toBe(`0${NBSP}FCFA`);
  });
});

describe('priceOrFreeLabel', () => {
  it('dit « Gratuit » plutôt que « 0 FCFA »', () => {
    expect(priceOrFreeLabel(0)).toBe('Gratuit');
    expect(priceOrFreeLabel(null)).toBe('Gratuit');
    expect(priceOrFreeLabel(2000)).toBe(`2${THIN}000${NBSP}FCFA`);
  });
});
