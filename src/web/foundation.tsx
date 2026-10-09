/**
 * Fondations DS — Card, Badge, Stat, SectionLabel.
 * Séparées du barrel pour que primitives/autres modules les importent
 * sans cycle (index ré-exporte tout).
 */
import type { HTMLAttributes, ReactNode } from 'react';

import type { Tone } from '../lib/tone';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: CardProps) {
  return <div className={cx('e237-card', className)} {...rest} />;
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Ton sémantique — voir `lib/tone.ts`. `accent` par défaut. */
  tone?: Tone;
  /**
   * `sm` : pastille compacte (11 px, sans marge verticale) pour une case
   * dense — légende d'une rencontre, ligne de tableau. `md` par défaut.
   */
  size?: 'sm' | 'md';
  /**
   * `subtle` (défaut) : fond et liseré « subtle » du ton — la pastille de
   * statut, la seule recette sur une page ou une carte.
   * `on-media` : posée SUR une image (couverture, photo de salle) — voile
   * sombre et encre claire, identiques dans les deux thèmes, le ton ne
   * colore que la pastille d'état. La seule pastille translucide du DS.
   */
  variant?: 'subtle' | 'on-media';
}

/**
 * Pastille — LE système de pilules du web (lot R, 09/10/2026) :
 * - statut : `<Badge tone=…>` (fond et liseré « subtle » du ton) ;
 * - étiquette neutre (jeu, catégorie, « 2 jeux ») : `<Badge tone="neutral">` ;
 * - sur une image : `<Badge variant="on-media">` ;
 * - filtre cliquable : `FilterChip` (`./nav`), pas une pastille.
 */
export function Badge({
  tone = 'accent',
  size = 'md',
  variant = 'subtle',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        'e237-badge',
        tone !== 'accent' && `e237-badge--${tone}`,
        size === 'sm' && 'e237-badge--sm',
        variant === 'on-media' && 'e237-badge--on-media',
        className,
      )}
      {...rest}
    />
  );
}

export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: ReactNode;
  label: ReactNode;
  /**
   * À droite de la valeur, sur la même ligne (mini-courbe, icône). La
   * statistique prend alors toute la largeur de son conteneur.
   */
  aside?: ReactNode;
  /** Lignes complémentaires sous le libellé (variation, précision). */
  children?: ReactNode;
}

/**
 * Une statistique : valeur, libellé, et au besoin ce qui l'accompagne.
 * Posée dans une `Card`, c'est la tuile d'indicateur du DS (tableaux de
 * bord, back-office) — inutile d'en recréer une.
 */
export function Stat({
  value,
  label,
  aside,
  children,
  className,
  ...rest
}: StatProps) {
  return (
    <div className={cx('e237-stat', aside != null && 'e237-stat--wide', className)} {...rest}>
      {aside != null ? (
        <span className="e237-stat__row">
          <span className="e237-stat__value">{value}</span>
          {aside}
        </span>
      ) : (
        <span className="e237-stat__value">{value}</span>
      )}
      <span className="e237-stat__label">{label}</span>
      {children != null ? <span className="e237-stat__meta">{children}</span> : null}
    </div>
  );
}

export interface SectionLabelProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * `cyan` (défaut) : titre de section. `muted` : intertitre discret dans
   * une carte ou un panneau (« Matchs de la poule », « Qualifiés »).
   * `gold` : intertitre d'un palmarès (« Champion »).
   */
  tone?: 'cyan' | 'muted' | 'gold';
}

/** Label de section en capitales (cyan par défaut, cf. maquettes). */
export function SectionLabel({ tone = 'cyan', className, ...rest }: SectionLabelProps) {
  return (
    <span
      className={cx(
        'e237-section-label',
        tone !== 'cyan' && `e237-section-label--${tone}`,
        className,
      )}
      {...rest}
    />
  );
}
