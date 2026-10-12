import { describe, expect, it } from "bun:test";

import { cardStatText, cardStats, cityAbbr, cityPlaceLabel, gameCategory } from "./player-stats";

const abbrs = (gameSlug: string) =>
  cardStats({ gameSlug, rating: 70, seed: "joueur" }).map((s) => s.abbr);

describe("stats de carte par discipline", () => {
  it("échecs et dames ont des stats de jeu de plateau, pas de tireur (visite du 09/10/2026)", () => {
    expect(gameCategory("echecs")).toBe("board");
    expect(gameCategory("dames")).toBe("board");
    expect(abbrs("echecs")).toEqual(["OUV", "TAC", "STR", "CAL", "FIN", "CON"]);
    expect(abbrs("echecs")).not.toContain("AIM");
  });

  it("le Ludo a les siennes", () => {
    expect(gameCategory("ludo")).toBe("ludo");
    expect(abbrs("ludo")).not.toContain("AIM");
    expect(abbrs("ludo")).toHaveLength(6);
  });

  it("un jeu inconnu garde la catégorie générique, FC 27 le football", () => {
    expect(gameCategory("nouveau-jeu")).toBe("generic");
    expect(abbrs("fc27")).toEqual(["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"]);
  });

  it("les stats configurées par le back-office priment", () => {
    const rows = cardStats({
      gameSlug: "echecs",
      rating: 70,
      seed: "joueur",
      statDefs: [{ key: "blitz", abbr: "BLZ", label: "Blitz" }],
      stats: { blitz: 88 },
    });
    expect(rows).toEqual([{ abbr: "BLZ", label: "Blitz", value: 88 }]);
  });
});

describe("cardStatText — stats neutres d'une carte neuve", () => {
  it("affiche la valeur d'ordinaire", () => {
    expect(cardStatText(73, false)).toBe("73");
    expect(cardStatText(73)).toBe("73");
  });

  it("« — » tant que la carte n'a pas de duel (mobA-28)", () => {
    expect(cardStatText(73, true)).toBe("—");
  });
});

describe("le lieu de la carte, abrégé et en clair (audit mobA-13)", () => {
  it("l'abrégé se lit en toutes lettres au survol ou au lecteur d'écran", () => {
    expect(cityAbbr("Littoral")).toBe("LIT");
    expect(cityPlaceLabel("Littoral")).toBe("Littoral");
    expect(cityAbbr("Douala")).toBe("DLA");
    expect(cityPlaceLabel(" Douala ")).toBe("Douala");
  });
  it("sans lieu : « CMR », c'est le Cameroun", () => {
    expect(cityAbbr(null)).toBe("CMR");
    expect(cityPlaceLabel(null)).toBe("Cameroun");
    expect(cityPlaceLabel("  ")).toBe("Cameroun");
  });
});
