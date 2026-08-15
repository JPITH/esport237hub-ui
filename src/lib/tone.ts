/**
 * Tons sémantiques du design system — vocabulaire commun au web
 * (`Badge tone=…`) et au natif (`BadgeTone`). Défini dans `lib` pour que les
 * tables de correspondance statut → ton n'aient pas à dépendre d'une
 * plateforme.
 */
export type Tone =
  /** Interactif — un bouton, un élément actif. JAMAIS un état. */
  | 'accent'
  /** En direct, en cours. */
  | 'cyan'
  /** Abouti, gagné, validé — émeraude, distincte du lime de l'accent. */
  | 'success'
  /** Information neutre : la chose avance, rien à faire. */
  | 'info'
  /** Podium, division Elite. Décoratif. */
  | 'gold'
  /** Perdu, contesté, destructif. */
  | 'danger'
  /** En attente, litige, action attendue de l'utilisateur. */
  | 'warning'
  /** Rien à signaler. */
  | 'neutral';
