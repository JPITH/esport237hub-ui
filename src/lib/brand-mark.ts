/**
 * Le SIGNE de la marque — hexagone + monogramme « G/H ».
 *
 * ⚠️ PROVISOIRE, et il faut le savoir avant d'y toucher. Le porteur n'a PAS
 * validé ce dessin (20/08/2026). La planche de référence est une image tramée,
 * avec dégradés et facettes 3D ; ce qui suit en est une interprétation
 * VECTORIELLE À PLAT — même construction, même géométrie, deux encres, mais
 * pas les facettes.
 *
 * La suite est décidée : on attend le fichier vectoriel du graphiste
 * (.ai / .svg / .eps). Il remplacera les tracés ci-dessous et RIEN D'AUTRE —
 * composants, icônes des stores et favicons se régénèrent depuis eux
 * (`bun run brand:icons` dans le monorepo).
 *
 * Donc : ne pas relancer d'aller-retour d'affinage sur ces coordonnées. Quatre
 * itérations à l'aveugle n'ont pas convergé, et c'est normal — on ne retrouve
 * pas un dégradé au jugé. En attendant le fichier source, ce signe tient sa
 * place ; il ne prétend pas être l'identité définitive.
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
 * Cadre hexagonal. Contour extérieur (rayon 112) puis contour intérieur
 * (rayon 103) écrit dans l'autre sens : le trou est produit par le SENS, pas
 * par une règle de remplissage exotique. Le trait fait donc environ 7,8 unités
 * mesuré perpendiculairement au côté — fin, comme sur la planche : un cadre
 * épais écrase le monogramme au lieu de le porter.
 */
export const MARK_RING_PATH =
  'M 128 16 L 224.99 72 L 224.99 184 L 128 240 L 31.01 184 L 31.01 72 Z M 128 25 L 38.8 76.5 L 38.8 179.5 L 128 231 L 217.2 179.5 L 217.2 76.5 Z';

/**
 * Le « G » — d'un seul tenant, et c'est LUI qui porte la moitié haute du « H ».
 *
 * Trois choses font tout, et les trois manquaient à la première version :
 *
 *  1. LES COUPES À 45°. Tous les angles saillants sont biseautés sur 14 à 16
 *     unités. C'est ce qui distingue un monogramme PLIÉ d'un empilement de
 *     rectangles — sans elles le signe se lit comme du pixel art, ce qui était
 *     exactement le reproche.
 *
 *  2. LA LANGUE. Le tracé descend du bras supérieur (x 128→154) au lieu de
 *     s'arrêter : c'est le retour du G, et c'est aussi la moitié HAUTE du
 *     montant gauche du « H ». Sans elle, le blanc n'est qu'un « C ».
 *
 *  3. LE PLI, deux fois. En haut, la langue se termine sur une diagonale
 *     (154,90)→(128,116) que le vert reprend cinq unités plus bas : un même
 *     trait change d'encre en cours de route, et la couture sombre entre les
 *     deux est le pli de la planche. En bas, le bras s'arrête à x 124 quand le
 *     vert commence à 128 — quatre unités de fond, la même couture, verticale.
 *     Sans ces deux coutures, blanc et vert se touchent à plat et l'entrelacs
 *     disparaît.
 *
 * L'ouverture (la bouche du G) reste franche : y poser une coupe la
 * refermerait à l'œil.
 */
export const MARK_LETTER_G_PATH =
  'M 62 74 L 78 58 L 140 58 L 154 72 L 154 90 L 128 116 L 128 84 L 104 84 L 88 100 L 88 156 L 104 172 L 124 172 L 124 184 L 110 198 L 78 198 L 62 182 Z';

/**
 * Le « H » — trois traits, tous écrits dans le MÊME sens : leur union est
 * exactement le remplissage `nonzero`.
 *
 *  * le montant gauche REPREND la langue du G sur la même diagonale, cinq
 *    unités plus bas, et descend plus bas que le G. C'est le pli : un seul
 *    trait, deux encres ;
 *  * la traverse, seule partie verte à couper la bouche du G ;
 *  * le montant droit, qui monte plus haut que le gauche ne descend. Ce
 *    déséquilibre est voulu — c'est lui qui donne son élan au signe sur la
 *    planche, et le corriger le rendrait inerte.
 *
 * Coupes à 45° à toutes les extrémités libres, comme sur le G.
 */
export const MARK_LETTER_H_PATH =
  'M 128 122 L 154 96 L 154 196 L 140 210 L 128 210 Z M 190 72 L 202 72 L 202 172 L 188 186 L 176 186 L 176 86 Z M 128 128 L 202 128 L 202 154 L 128 154 Z';

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
