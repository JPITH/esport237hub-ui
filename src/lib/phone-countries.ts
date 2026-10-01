/**
 * Indicatifs téléphoniques proposés par `PhoneInput` (web) quand on lui passe
 * `countries`. Ordre = poids pour G-HUB : le Cameroun d'abord, puis la zone
 * CEMAC, l'Afrique de l'Ouest francophone et le Nigeria voisin, puis la
 * diaspora (France, Belgique).
 *
 * Sans `countries`, `PhoneInput` garde son comportement historique : préfixe
 * verrouillé sur +237 (Mobile Money, qui n'opère qu'au Cameroun).
 */
export interface PhoneCountry {
  /** Code ISO 3166-1 alpha-2 (« CM »). */
  code: string;
  /** Nom français affiché dans le menu. */
  name: string;
  /** Indicatif sans « + » (« 237 »). */
  dial: string;
  /** Longueur maximale du numéro national, sans indicatif. */
  maxDigits: number;
  /** Découpage d'affichage du numéro national (« 3 2 2 2 » → 6XX XX XX XX). */
  groups: number[];
  /** Exemple affiché en indication. */
  placeholder: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'CM', name: 'Cameroun', dial: '237', maxDigits: 9, groups: [3, 2, 2, 2], placeholder: '6XX XX XX XX' },
  { code: 'GA', name: 'Gabon', dial: '241', maxDigits: 9, groups: [3, 2, 2, 2], placeholder: '0XX XX XX XX' },
  { code: 'TD', name: 'Tchad', dial: '235', maxDigits: 8, groups: [2, 2, 2, 2], placeholder: 'XX XX XX XX' },
  { code: 'CG', name: 'Congo', dial: '242', maxDigits: 9, groups: [2, 3, 2, 2], placeholder: '0X XXX XX XX' },
  { code: 'CF', name: 'Centrafrique', dial: '236', maxDigits: 8, groups: [2, 2, 2, 2], placeholder: 'XX XX XX XX' },
  { code: 'GQ', name: 'Guinée équatoriale', dial: '240', maxDigits: 9, groups: [3, 3, 3], placeholder: 'XXX XXX XXX' },
  { code: 'NG', name: 'Nigeria', dial: '234', maxDigits: 10, groups: [3, 3, 4], placeholder: 'XXX XXX XXXX' },
  { code: 'CI', name: 'Côte d’Ivoire', dial: '225', maxDigits: 10, groups: [2, 2, 2, 2, 2], placeholder: 'XX XX XX XX XX' },
  { code: 'SN', name: 'Sénégal', dial: '221', maxDigits: 9, groups: [2, 3, 2, 2], placeholder: '7X XXX XX XX' },
  { code: 'FR', name: 'France', dial: '33', maxDigits: 9, groups: [1, 2, 2, 2, 2], placeholder: '6 XX XX XX XX' },
  { code: 'BE', name: 'Belgique', dial: '32', maxDigits: 9, groups: [3, 2, 2, 2], placeholder: '4XX XX XX XX' },
];

export function findPhoneCountry(code: string | undefined): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.code === code) ?? PHONE_COUNTRIES[0]!;
}

/** Garde les chiffres seulement, dans la limite du pays. */
export function phoneDigits(raw: string, country: PhoneCountry): string {
  return raw.replace(/\D/g, '').slice(0, country.maxDigits);
}

/** « 699000000 » → « 699 00 00 00 », selon le découpage du pays. */
export function formatPhoneDigits(digits: string, country: PhoneCountry): string {
  const parts: string[] = [];
  let at = 0;
  for (const size of country.groups) {
    if (at >= digits.length) break;
    parts.push(digits.slice(at, at + size));
    at += size;
  }
  if (at < digits.length) parts.push(digits.slice(at));
  return parts.join(' ');
}

/** Numéro international E.164 (« +237699000000 ») ; chaîne vide si pas de chiffres. */
export function toE164(digits: string, country: PhoneCountry): string {
  return digits ? `+${country.dial}${digits}` : '';
}
