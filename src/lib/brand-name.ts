/**
 * Le NOM du produit — une seule écriture, pour toutes les surfaces.
 *
 * POURQUOI CE MODULE EXISTE
 *
 * Le 05/09/2026, le produit s'est appelé **G-HUB** et plus « ESPORT 237 HUB ».
 * Le renommage a atteint UN fichier — le mot-symbole du dashboard — et s'est
 * arrêté là. Le 17/09/2026, douze jours plus tard, les écrans
 * d'authentification du web et l'app mobile ENTIÈRE affichaient encore
 * l'ancien nom, parce qu'il était écrit littéralement à six endroits :
 *
 *   web/brand.tsx · native/brand.tsx (×3, dont deux étiquettes
 *   d'accessibilité) · native/auth.tsx · native/player-card.tsx
 *
 * Aucun de ces six endroits n'était faux ; c'est leur NOMBRE qui l'était. Un
 * nom de produit recopié est un nom de produit qui changera à moitié.
 *
 * Donc : le nom se lit ici, et nulle part ailleurs. Les surfaces composent
 * l'affichage à partir des pièces — c'est nécessaire parce que le « G » porte
 * l'accent de la marque, et que le web le fait avec un `<span>` quand le natif
 * le fait avec un `<Text>` imbriqué : on ne peut pas partager le rendu, on
 * partage la donnée.
 */

/** Le nom, d'un seul tenant. Pour un `aria-label`, un titre, un partage. */
export const BRAND_NAME = 'G-HUB';

/**
 * La lettre qui porte l'accent. Séparée du reste parce que chaque plateforme
 * la colore avec sa propre mécanique.
 */
export const BRAND_NAME_ACCENT = 'G';

/** Ce qui suit la lettre accentuée, dans l'encre du texte. */
export const BRAND_NAME_REST = '-HUB';

/** Étiquette d'accessibilité du bloc de marque cliquable. */
export const BRAND_HOME_LABEL = `${BRAND_NAME} — accueil`;
