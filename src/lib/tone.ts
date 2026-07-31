/**
 * Tons sémantiques du design system — vocabulaire commun au web
 * (`Badge tone=…`) et au natif (`BadgeTone`). Défini dans `lib` pour que les
 * tables de correspondance statut → ton n'aient pas à dépendre d'une
 * plateforme.
 */
export type Tone = 'accent' | 'cyan' | 'gold' | 'danger' | 'warning' | 'neutral';
