import { describe, expect, it } from "bun:test";

import { cardStats, gameCategory } from "./player-stats";

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
