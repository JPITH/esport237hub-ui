/**
 * Le SIGNE de la marque — hexagone + monogramme « G/H ».
 *
 * Variante retenue par le porteur (20/08/2026) : la planche « Variations du
 * logo — inspiration #1 », proposition **02**, cadre hexagonal. C'est ce signe
 * qui sert d'icône d'application (iOS, Android, favicon) et de pastille dans
 * le bloc de marque : un « E » posé dans un carré arrondi ne tenait pas à
 * 48 px et ne ressemblait à rien de la planche.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI DES TRACÉS LITTÉRAUX, ET NON UN CALCUL
 *
 * Ces chaînes sont lues à DEUX endroits qui ne partagent pas de runtime :
 *  * le design system (web `<svg>` et natif `react-native-svg`) — même signe,
 *    aux mêmes coordonnées, sur les trois plateformes ;
 *  * `scripts/brand-icons.py` du monorepo, qui rastérise les icônes livrées
 *    aux stores. Il les extrait par expression régulière sur
 *    `export const MARK_*_PATH = '…'`.
 *
 * Donc : une constante par tracé, une seule chaîne littérale entre apostrophes,
 * jamais de concaténation ni de gabarit. Changer la forme du signe se fait ici
 * et NULLE PART AILLEURS — puis on rejoue `bun run brand:icons`.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Repère : carré de 256, centre (128, 128). L'hexagone est « pointe en haut »
 * (sommets à 12 h et 6 h, côtés verticaux à gauche et à droite), rayon
 * circonscrit 112 à l'extérieur, 100 à l'intérieur — soit un trait d'environ
 * 10,4 px mesuré perpendiculairement au côté.
 *
 * Les trois tracés se remplissent en `nonzero` :
 *  * l'anneau est un contour horaire suivi d'un contour ANTI-horaire — le
 *    second creuse le premier, c'est ce qui fait le vide au centre. Le rendre
 *    en `stroke` aurait donné un résultat différent du rastériseur Python, qui
 *    ne sait que remplir ;
 *  * le « G » est un C carré ouvert à droite, d'un seul tenant ;
 *  * le « H » est fait de trois rectangles de même sens : leur union est
 *    exactement le remplissage `nonzero`.
 */

/** Côté du repère. Le `viewBox` du signe est `0 0 256 256`. */
export const MARK_SIZE = 256;

/** `viewBox` prêt à poser sur un `<svg>` / `<Svg>`. */
export const MARK_VIEW_BOX = `0 0 ${MARK_SIZE} ${MARK_SIZE}`;

/**
 * Cadre hexagonal. Contour extérieur horaire (rayon 112), contour intérieur
 * anti-horaire (rayon 100) : le trou est produit par le sens, pas par une
 * règle de remplissage exotique.
 */
export const MARK_RING_PATH =
  'M 128 16 L 224.99 72 L 224.99 184 L 128 240 L 31.01 184 L 31.01 72 Z M 128 28 L 41.4 78 L 41.4 178 L 128 228 L 214.6 178 L 214.6 78 Z';

/**
 * Le « G » — un C carré ouvert à droite. La barre verticale du « H » vient se
 * poser dans son ouverture et lui tient lieu de retour : c'est le pivot du
 * monogramme, les deux lettres partagent un trait au lieu de se juxtaposer.
 */
export const MARK_LETTER_G_PATH =
  'M 66 70 L 138 70 L 138 88 L 84 88 L 84 168 L 138 168 L 138 186 L 66 186 Z';

/**
 * Le « H » — montant gauche (plus haut, il traverse le G), montant droit,
 * traverse. Trois rectangles écrits dans le même sens : leur union est le
 * remplissage. Le déséquilibre des deux montants est voulu, c'est ce qui donne
 * au signe son élan sur la planche.
 */
export const MARK_LETTER_H_PATH =
  'M 122 58 L 142 58 L 142 198 L 122 198 Z M 170 74 L 190 74 L 190 182 L 170 182 Z M 122 118 L 190 118 L 190 138 L 122 138 Z';

/**
 * Hexagone PLEIN — la variante des toutes petites tailles. En dessous d'une
 * vingtaine de pixels (favicon 16, pastille de notification) le vide du
 * contour se referme et le signe devient une tache : on garde alors la
 * silhouette hexagonale pleine et le monogramme s'y détache en clair.
 */
export const MARK_HEX_SOLID_PATH =
  'M 128 16 L 224.99 72 L 224.99 184 L 128 240 L 31.01 184 L 31.01 72 Z';

/**
 * Les trois pièces dans leur ORDRE DE PEINTURE — le « H » passe par-dessus le
 * « G », c'est l'entrelacement de la planche. Le rôle dit quelle encre poser :
 * `accent` la marque (vert), `contrast` le trait clair (blanc sur fond sombre,
 * encre du texte sur fond clair).
 */
export const MARK_PARTS_OUTLINE = [
  { key: 'ring', role: 'accent', d: MARK_RING_PATH },
  { key: 'letterG', role: 'contrast', d: MARK_LETTER_G_PATH },
  { key: 'letterH', role: 'accent', d: MARK_LETTER_H_PATH },
] as const;

/**
 * Variante pleine : la silhouette porte l'accent, le monogramme entier passe
 * en encre posée-sur-accent. Deux encres au lieu de trois — à 16 px, la
 * troisième ne se voyait pas, elle ne faisait que salir le vert.
 */
export const MARK_PARTS_SOLID = [
  { key: 'hex', role: 'accent', d: MARK_HEX_SOLID_PATH },
  { key: 'letterG', role: 'onAccent', d: MARK_LETTER_G_PATH },
  { key: 'letterH', role: 'onAccent', d: MARK_LETTER_H_PATH },
] as const;

/** Rôle d'encre d'une pièce du signe. */
export type MarkPartRole = 'accent' | 'contrast' | 'onAccent';

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
