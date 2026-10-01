import { describe, expect, it } from 'bun:test';

import {
  PHONE_COUNTRIES,
  findPhoneCountry,
  formatPhoneDigits,
  phoneDigits,
  toE164,
} from './phone-countries';

describe('phone-countries', () => {
  it('le Cameroun est le premier pays et le repli', () => {
    expect(PHONE_COUNTRIES[0]?.code).toBe('CM');
    expect(findPhoneCountry('ZZ').code).toBe('CM');
    expect(findPhoneCountry(undefined).code).toBe('CM');
  });

  it('un indicatif et un code uniques par pays', () => {
    const codes = PHONE_COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('le découpage couvre exactement la longueur maximale', () => {
    for (const c of PHONE_COUNTRIES) {
      expect(c.groups.reduce((a, b) => a + b, 0)).toBe(c.maxDigits);
    }
  });

  it('garde les chiffres, dans la limite du pays', () => {
    const cm = findPhoneCountry('CM');
    expect(phoneDigits('+237 6 99-00.00 00 99', cm)).toBe('237699000');
    expect(phoneDigits('6 99 00 00 00 12', cm)).toBe('699000000');
  });

  it('formate selon le pays', () => {
    expect(formatPhoneDigits('699000000', findPhoneCountry('CM'))).toBe('699 00 00 00');
    expect(formatPhoneDigits('6990', findPhoneCountry('CM'))).toBe('699 0');
    expect(formatPhoneDigits('612345678', findPhoneCountry('FR'))).toBe('6 12 34 56 78');
    expect(formatPhoneDigits('8031234567', findPhoneCountry('NG'))).toBe('803 123 4567');
  });

  it('rend le format E.164, vide sans chiffres', () => {
    expect(toE164('699000000', findPhoneCountry('CM'))).toBe('+237699000000');
    expect(toE164('', findPhoneCountry('CM'))).toBe('');
  });
});
