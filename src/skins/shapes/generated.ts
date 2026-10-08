/**
 * FICHIER GÉNÉRÉ par `bun scripts/card-shapes.ts` — ne pas éditer à la main.
 * Sources : `src/skins/shapes/<nom>.svg`, optimisées par SVGO (viewBox
 * conservé, 2 décimales). `--check` échoue si ce fichier n'est pas à jour.
 *
 * Poids des sources SVG, avant → après SVGO :
 *   bouclier   2130 o →  895 o
 *   biseau     1812 o →  770 o
 *   chevron    1804 o →  715 o
 *   coupe      1786 o →  751 o
 *   ecusson    1812 o →  798 o
 *   hexa       1715 o →  716 o
 *   ticket     1952 o →  912 o
 *   total     13011 o → 5557 o
 *
 * Repère : 300 × 419.05 (celui de geometry.ts). `frame` et `surface` sont
 * des chaînes `d` prêtes à poser sur un <path> ; `unit` est la silhouette en
 * unités de boîte (0 → 1) pour un clipPath `objectBoundingBox`. Rectangles :
 * [x, y, largeur, hauteur]. Ancrages : ordonnée du bord haut de la plaque jeu
 * (`crest`) et du bord bas du pied (`footer`).
 */

export const CARD_SHAPE_VIEW = { width: 300, height: 419.05 } as const;

/** Formes disponibles — la première est la forme par défaut. */
export const CARD_SHAPE_NAMES = ["bouclier", "biseau", "chevron", "coupe", "ecusson", "hexa", "ticket"] as const;
export type CardShapeName = (typeof CARD_SHAPE_NAMES)[number];

export interface CardShapeSource {
  name: CardShapeName;
  label: string;
  description: string;
  frame: string;
  surface: string;
  unit: string;
  safe: readonly [number, number, number, number];
  sheen: readonly [number, number, number, number];
  anchors: { readonly crest: number; readonly footer: number };
}

export const CARD_SHAPE_SOURCES: Readonly<Record<CardShapeName, CardShapeSource>> = {
  bouclier: {
    name: "bouclier",
    label: "Bouclier",
    description: "Bouclier crénelé « Founders » — la forme historique et la forme par défaut.",
    frame: "m48 12.57 66-8.38 36 12.57 36-12.57 66 8.38 36 33.53 6 259.81-24 62.85-120 50.29-120-50.29-24-62.85L12 46.1Z",
    surface: "m53.71 23.6 62.31-7.91L150 27.56l33.98-11.87 62.31 7.91 33.98 31.65 5.67 245.26-22.66 59.34L150 407.32 36.72 359.85l-22.66-59.34 5.67-245.26Z",
    unit: "M0.16 0.03L0.38 0.01L0.5 0.04L0.62 0.01L0.84 0.03L0.96 0.11L0.98 0.73L0.9 0.88L0.5 1L0.1 0.88L0.02 0.73L0.04 0.11Z",
    safe: [36, 36.88, 228, 323.51],
    sheen: [0, 33.52, 300, 335.24],
    anchors: { crest: 5.03, footer: 390.55 },
  },
  biseau: {
    name: "biseau",
    label: "Biseau asymétrique",
    description: "Grands pans coupés en haut à droite et en bas à gauche : la carte « file » en diagonale.",
    frame: "M14 0h222l64 64v341.05l-14 14H64l-64-64V14Z",
    surface: "M17.73 9h214.54L291 67.73v333.59l-8.73 8.73H67.73L9 351.32V17.73Z",
    unit: "M0.0467 0L0.7867 0L1 0.1527L1 0.9666L0.9533 1L0.2133 1L0 0.8473L0 0.0334Z",
    safe: [36, 44, 228, 316.38],
    sheen: [0, 64, 300, 291.05],
    anchors: { crest: 5.03, footer: 390.55 },
  },
  chevron: {
    name: "chevron",
    label: "Chevrons",
    description: "Haut en V rentrant, bas en pointe : la silhouette d’un galon de grade.",
    frame: "m0 0 150 30L300 0v389.05l-150 30-150-30Z",
    surface: "m9 10.98 141 28.2 141-28.2v370.69l-141 28.2-141-28.2Z",
    unit: "M0 0L0.5 0.0716L1 0L1 0.9284L0.5 1L0 0.9284Z",
    safe: [36, 46, 228, 316],
    sheen: [0, 30, 300, 359.05],
    anchors: { crest: 21, footer: 396 },
  },
  coupe: {
    name: "coupe",
    label: "Angles coupés",
    description: "Rectangle aux quatre coins coupés à 45°, le gabarit des écrans de jeu.",
    frame: "M30 0h240l30 30v359.05l-30 30H30l-30-30V30Z",
    surface: "M33.73 9h232.54L291 33.73v351.59l-24.73 24.73H33.73L9 385.32V33.73Z",
    unit: "M0.1 0L0.9 0L1 0.0716L1 0.9284L0.9 1L0.1 1L0 0.9284L0 0.0716Z",
    safe: [36, 36.88, 228, 323.51],
    sheen: [0, 30, 300, 359.05],
    anchors: { crest: 5.03, footer: 390.55 },
  },
  ecusson: {
    name: "ecusson",
    label: "Écusson",
    description: "Écu héraldique : haut droit aux coins cassés, flancs droits, pointe arrondie.",
    frame: "M10 0h280l10 10v282c0 82-62 111-150 127.05C62 403 0 374 0 292V10Z",
    surface: "M13.73 9h272.54l4.73 4.73V292c0 76.27-55.76 102.35-141 117.9C64.76 394.35 9 368.27 9 292V13.73Z",
    unit: "M0.0333 0L0.9667 0L1 0.0239L1 0.6968C1 0.8925 0.7933 0.9617 0.5 1C0.2067 0.9617 0 0.8925 0 0.6968L0 0.0239Z",
    safe: [36, 36.88, 228, 323.51],
    sheen: [0, 10, 300, 282],
    anchors: { crest: 5.03, footer: 390.55 },
  },
  hexa: {
    name: "hexa",
    label: "Hexagone",
    description: "L'hexagone pointe en haut du signe G-HUB, étiré au format carte.",
    frame: "m150 0 150 56v307.05l-150 56-150-56V56Z",
    surface: "m150 9.61 141 52.64V356.8l-141 52.64L9 356.8V62.25Z",
    unit: "M0.5 0L1 0.1336L1 0.8664L0.5 1L0 0.8664L0 0.1336Z",
    safe: [36, 53, 228, 311],
    sheen: [0, 56, 300, 307.05],
    anchors: { crest: 5.03, footer: 390.55 },
  },
  ticket: {
    name: "ticket",
    label: "Ticket",
    description: "Billet d’entrée : coins arrondis et deux encoches entre le nom et les stats.",
    frame: "M16 0h268a16 16 0 0 1 16 16v249.93a14 14 0 0 0 0 28v109.12a16 16 0 0 1-16 16H16a16 16 0 0 1-16-16V293.93a14 14 0 0 0 0-28V16A16 16 0 0 1 16 0Z",
    surface: "M16 9h268a7 7 0 0 1 7 7v242.76a23 23 0 0 0 0 42.33v101.96a7 7 0 0 1-7 7H16a7 7 0 0 1-7-7V301.09a23 23 0 0 0 0-42.33V16a7 7 0 0 1 7-7Z",
    unit: "M0.0533 0L0.9467 0C0.9761 0 1 0.0171 1 0.0382L1 0.6346C0.9742 0.6346 0.9533 0.6496 0.9533 0.668C0.9533 0.6865 0.9742 0.7014 1 0.7014L1 0.9618C1 0.9829 0.9761 1 0.9467 1L0.0533 1C0.0239 1 0 0.9829 0 0.9618L0 0.7014C0.0258 0.7014 0.0467 0.6865 0.0467 0.668C0.0467 0.6496 0.0258 0.6346 0 0.6346L0 0.0382C0 0.0171 0.0239 0 0.0533 0Z",
    safe: [36, 36.88, 228, 323.51],
    sheen: [14, 16, 272, 387.05],
    anchors: { crest: 5.03, footer: 390.55 },
  },
};
