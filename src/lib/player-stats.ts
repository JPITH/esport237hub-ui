/**
 * Stats de carte par CATÉGORIE de jeu.
 *
 * Chaque jeu appartient à une catégorie (football, PVP mobile…) et n'affiche
 * pas les mêmes statistiques : un jeu de foot (FC 27) montre PAC/SHO/PAS/DRI/
 * DEF/PHY ; un PVP mobile (Clash Royale) montre attaque/défense/cycle…
 *
 * Les vraies valeurs proviendront du back-office (relevé par la salle à chaque
 * duel, stockées dans player_game_profiles.stats). En leur absence, on dérive
 * une valeur déterministe à partir de l'id joueur + la note, pour un rendu
 * réaliste et stable — jamais aléatoire.
 */

export type GameCategory = "football" | "pvp_mobile" | "generic";

export interface StatDef {
  key: string;
  abbr: string;
  label: string;
}

const CATEGORY_BY_SLUG: Record<string, GameCategory> = {
  fc27: "football",
  "call-of-duty": "generic",
  "clash-royale": "pvp_mobile",
  "pubg-mobile": "generic",
  valorant: "generic",
};

export function gameCategory(slug: string | undefined): GameCategory {
  return (slug && CATEGORY_BY_SLUG[slug]) || "generic";
}

export const STAT_DEFS: Record<GameCategory, StatDef[]> = {
  football: [
    { key: "pac", abbr: "PAC", label: "Vitesse" },
    { key: "sho", abbr: "SHO", label: "Tir" },
    { key: "pas", abbr: "PAS", label: "Passe" },
    { key: "dri", abbr: "DRI", label: "Dribble" },
    { key: "def", abbr: "DEF", label: "Défense" },
    { key: "phy", abbr: "PHY", label: "Physique" },
  ],
  pvp_mobile: [
    { key: "att", abbr: "ATT", label: "Attaque" },
    { key: "def", abbr: "DEF", label: "Défense" },
    { key: "cyc", abbr: "CYC", label: "Cycle" },
    { key: "eli", abbr: "ELI", label: "Élixir" },
    { key: "tro", abbr: "TRO", label: "Trophées" },
    { key: "win", abbr: "WIN", label: "Régularité" },
  ],
  generic: [
    { key: "s1", abbr: "AIM", label: "Précision" },
    { key: "s2", abbr: "REF", label: "Réflexes" },
    { key: "s3", abbr: "TAC", label: "Tactique" },
    { key: "s4", abbr: "MAP", label: "Map" },
    { key: "s5", abbr: "CLU", label: "Clutch" },
    { key: "s6", abbr: "CON", label: "Constance" },
  ],
};

/** Hash déterministe d'une chaîne (djb2), pour dériver des stats stables. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Valeur d'une stat : réelle si fournie, sinon dérivée autour de la note. */
export function statValue(
  stats: Record<string, number> | null | undefined,
  key: string,
  rating: number,
  seed: string,
): number {
  const real = stats?.[key];
  if (typeof real === "number") return real;
  const offset = (hash(seed + ":" + key) % 22) - 8; // -8 … +13
  return clamp(rating + offset, 42, 99);
}

/** Liste (abbr, valeur) prête à afficher pour un profil de jeu. */
export function cardStats(input: {
  gameSlug?: string | undefined;
  rating: number;
  stats?: Record<string, number> | null;
  seed: string;
  /** Stats configurées par le back-office (prioritaires sur les catégories internes). */
  statDefs?: StatDef[];
}): { abbr: string; label: string; value: number }[] {
  const defs =
    input.statDefs && input.statDefs.length > 0
      ? input.statDefs
      : STAT_DEFS[gameCategory(input.gameSlug)];
  return defs.map((d) => ({
    abbr: d.abbr,
    label: d.label,
    value: statValue(input.stats, d.key, input.rating, input.seed),
  }));
}

const CITY_ABBR: Record<string, string> = {
  douala: "DLA",
  yaounde: "YDE",
  yaoundé: "YDE",
  bafoussam: "BAF",
  bamenda: "BMD",
  garoua: "GRA",
  maroua: "MRA",
  bertoua: "BTA",
  ngaoundere: "NGD",
  ngaoundéré: "NGD",
  buea: "BUE",
  kribi: "KRI",
  limbe: "LMB",
  limbé: "LMB",
};

/** Abrégé 3 lettres de la ville (remplace le « poste » sur la carte). */
export function cityAbbr(city: string | null | undefined): string {
  if (!city) return "CMR";
  const key = city.trim().toLowerCase();
  if (CITY_ABBR[key]) return CITY_ABBR[key];
  return city
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();
}
