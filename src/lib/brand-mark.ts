/**
 * Le SIGNE de la marque — hexagone + monogramme « G/H ».
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * D'OÙ VIENNENT CES TRACÉS (17/09/2026)
 *
 * Du fichier vectoriel fourni par le porteur — `ghub-iconsvg.svg`, repère
 * 800×800. C'est l'attente que la version précédente de ce fichier annonçait :
 * « on attend le fichier vectoriel du graphiste ; il remplacera les tracés
 * ci-dessous et RIEN D'AUTRE ». Il est arrivé, il les a remplacés, et le signe
 * n'est donc plus une interprétation à plat d'une planche tramée : c'est le
 * dessin lui-même.
 *
 * Trois choses ont dû être TRADUITES, parce que le SVG source s'autorise ce
 * que le rastériseur de `scripts/brand-icons.py` ne sait pas faire :
 *
 *  1. LE CADRE ÉTAIT UN `stroke` (largeur 13, jointure `miter`). Le rastériseur
 *     ne sait que REMPLIR. Le contour est donc converti en anneau plein : un
 *     hexagone extérieur horaire, un hexagone intérieur anti-horaire, et le
 *     vide naît du SENS des contours — pas d'une règle de remplissage exotique.
 *     Les deux rayons encadrent le rayon d'origine (366) de la demi-épaisseur
 *     mesurée perpendiculairement au côté : 6,5 / cos 30° = 7,5056.
 *
 *  2. LE MONOGRAMME ÉTAIT DANS UN `<g transform="translate(-69 6.7)">`. La
 *     translation est appliquée une fois pour toutes dans les coordonnées
 *     ci-dessous : un tracé qui a besoin d'un groupe pour être au bon endroit
 *     est un tracé qu'on posera un jour de travers.
 *
 *  3. LE FOND NOIR DU SVG N'EST PAS REPRIS. Le signe doit vivre en clair comme
 *     en sombre (DESIGN.md, règle 4) ; l'aplat sombre est posé par la surface
 *     qui l'accueille — `SURFACE` pour les icônes des stores, rien du tout pour
 *     un favicon transparent.
 *
 * CE QUI N'A PAS CHANGÉ : les encres restent des RÔLES, jamais des hex. Le SVG
 * source dit `#ADEB0B`, `#FFFFFF`, `#93CF0A` ; on garde le RAPPORT entre eux
 * (la marque, le trait clair, la marque d'un échelon plus sombre) et chaque
 * surface le résout dans son thème. Un hex écrit ici serait un vert inventé de
 * plus, et DESIGN.md l'interdit.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * POURQUOI DES TRACÉS LITTÉRAUX, ET NON UN CALCUL
 *
 * Ces chaînes sont lues à DEUX endroits qui ne partagent pas de runtime :
 *  * le design system (web `<svg>` et natif `react-native-svg`) — même signe,
 *    aux mêmes coordonnées, sur les trois plateformes ;
 *  * `scripts/brand-icons.py` du monorepo, qui rastérise les icônes livrées
 *    aux stores. Il les extrait par expression régulière sur
 *    `export const MARK_*_PATH = '…'` et lit `MARK_SIZE` de la même façon.
 *
 * Donc : une constante par tracé, une seule chaîne littérale entre apostrophes,
 * jamais de concaténation ni de gabarit. Changer la forme du signe se fait ici
 * et NULLE PART AILLEURS — puis on rejoue `bun run brand:icons`.
 */

/**
 * Côté du repère — celui du fichier source, gardé tel quel. Transposer les
 * coordonnées dans un carré de 256 aurait fait entrer un arrondi dans chaque
 * sommet pour ne rien gagner : le rastériseur et les deux moteurs SVG mettent
 * le tracé à l'échelle de toute façon.
 */
export const MARK_SIZE = 800;

/** `viewBox` prêt à poser sur un `<svg>` / `<Svg>`. */
export const MARK_VIEW_BOX = `0 0 ${MARK_SIZE} ${MARK_SIZE}`;

/**
 * Le cadre hexagonal, « pointe en haut ». Contour extérieur horaire
 * (rayon 373,51), contour intérieur anti-horaire (rayon 358,49) : leur
 * différence rend exactement le trait de 13 du fichier source.
 */
export const MARK_RING_PATH =
  'M 400 26.49 L 723.47 213.25 L 723.47 586.75 L 400 773.51 L 76.53 586.75 L 76.53 213.25 Z M 400 41.51 L 89.54 220.76 L 89.54 579.24 L 400 758.49 L 710.46 579.24 L 710.46 220.76 Z';

/**
 * Le « G » — deux contours de MÊME sens, donc leur union est le remplissage
 * `nonzero` : la panse, puis l'ergot qui prolonge le bras vers le « H ». C'est
 * cet ergot qui fait l'entrelacs : sans lui, le blanc n'est qu'un « C » posé à
 * côté du vert.
 */
export const MARK_LETTER_G_PATH =
  'M 180 274.7 L 441 136.4 L 441 228.4 L 264 322.2 L 264 521.7 L 357 571 L 357 663.7 L 180 569.9 Z M 357 368.7 L 441 324.2 L 441 417.2 L 357 461.7 Z';

/**
 * Le « H » — d'un seul tenant, en dix sommets. Le montant droit monte plus haut
 * que le gauche ne descend ; ce déséquilibre est celui du fichier source, et
 * c'est lui qui donne son élan au signe. Le corriger le rendrait inerte.
 */
export const MARK_LETTER_H_PATH =
  'M 357 461.7 L 536 366.8 L 536 241.7 L 620 197.2 L 620 524.3 L 536 568.8 L 536 458.9 L 441 509.2 L 441 619.2 L 357 663.7 Z';

/**
 * La traverse, un échelon plus sombre — la seule facette que le fichier source
 * conserve de la planche d'origine. Elle se pose PAR-DESSUS le « H » et donne
 * au pli son épaisseur ; sans elle le monogramme redevient plat.
 *
 * Elle disparaît dans la variante pleine : à 16 px, une quatrième encre sur un
 * quadrilatère de trois pixels ne fait que salir le vert.
 */
export const MARK_CROSSBAR_SHADE_PATH =
  'M 441 417.2 L 536 366.8 L 536 458.9 L 441 509.2 Z';

/**
 * Hexagone PLEIN — la variante des toutes petites tailles. En dessous d'une
 * vingtaine de pixels (favicon 16, pastille de notification) le vide du
 * contour se referme et le signe devient une tache : on garde alors la
 * silhouette hexagonale pleine et le monogramme s'y détache en clair.
 */
export const MARK_HEX_SOLID_PATH =
  'M 400 26.49 L 723.47 213.25 L 723.47 586.75 L 400 773.51 L 76.53 586.75 L 76.53 213.25 Z';

/**
 * Les pièces dans leur ORDRE DE PEINTURE, celui du fichier source : cadre, puis
 * « G », puis « H » par-dessus, puis la facette de la traverse. Le rôle dit
 * quelle encre poser ; aucune surface ne connaît de hex.
 */
export const MARK_PARTS_OUTLINE = [
  { key: 'ring', role: 'accent', d: MARK_RING_PATH },
  { key: 'letterG', role: 'contrast', d: MARK_LETTER_G_PATH },
  { key: 'letterH', role: 'accent', d: MARK_LETTER_H_PATH },
  { key: 'crossbarShade', role: 'accentShade', d: MARK_CROSSBAR_SHADE_PATH },
] as const;

/**
 * Variante pleine : la silhouette porte l'accent, le monogramme entier passe
 * en encre posée-sur-accent. Deux encres au lieu de quatre — à 16 px, les
 * autres ne se voient pas, elles ne font que salir le vert.
 */
export const MARK_PARTS_SOLID = [
  { key: 'hex', role: 'accent', d: MARK_HEX_SOLID_PATH },
  { key: 'letterG', role: 'onAccent', d: MARK_LETTER_G_PATH },
  { key: 'letterH', role: 'onAccent', d: MARK_LETTER_H_PATH },
] as const;

/**
 * Rôle d'encre d'une pièce du signe.
 *
 * `accentShade` est l'accent D'UN ÉCHELON PLUS SOMBRE, pas une couleur de plus :
 * les surfaces le résolvent sur le même barreau que l'état survolé de l'accent
 * (clair : 700 → 800 ; sombre : 400 → 500). C'est exactement le rapport que le
 * fichier source pose entre `#ADEB0B` et `#93CF0A`, et cela évite d'ajouter un
 * jeton — donc un test de contraste, une variable CSS et une couleur native —
 * pour un quadrilatère.
 */
export type MarkPartRole = 'accent' | 'contrast' | 'onAccent' | 'accentShade';

/** Une pièce du signe, telle que la parcourt un composant de rendu. */
export interface MarkPart {
  key: string;
  role: MarkPartRole;
  d: string;
}

/** Les deux façons de dessiner le signe. */
export type MarkVariant = 'outline' | 'solid';

/**
 * En dessous de cette taille, `markParts()` bascule tout seul sur la variante
 * pleine : aucune surface n'a à connaître la règle, elle demande juste le
 * signe à la taille qu'elle a.
 */
export const MARK_SOLID_BELOW = 20;

/**
 * Les pièces à peindre pour une taille donnée. `variant` force la main quand
 * la surface sait mieux (une planche de marque montre le contour, même petit).
 */
export function markParts(size: number, variant?: MarkVariant): readonly MarkPart[] {
  const resolved: MarkVariant = variant ?? (size < MARK_SOLID_BELOW ? 'solid' : 'outline');
  return resolved === 'solid' ? MARK_PARTS_SOLID : MARK_PARTS_OUTLINE;
}
