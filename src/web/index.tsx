/**
 * Composants web ESPORT 237 HUB (React 19).
 *
 * Stylés par les classes .e237-* et les variables --e237-* de theme.css :
 * importer `@esport237hub/ui/css` une fois dans l'application.
 * Light/dark : poser data-theme="light" | "dark" sur <html>
 * (absent = suit le système).
 */
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';

export * from './astryx.ts';
export { color, font, radius, spacing, tokens } from '../tokens/index.ts';
export type { ColorScale, ThemeMode } from '../tokens/index.ts';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = CTA vert, secondary = contour, ghost = texte. */
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'e237-btn',
        `e237-btn--${variant}`,
        size === 'sm' && 'e237-btn--sm',
        className,
      )}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: CardProps) {
  return <div className={cx('e237-card', className)} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** accent = vert (défaut), cyan, gold, danger, neutral. */
  tone?: 'accent' | 'cyan' | 'gold' | 'danger' | 'neutral';
}

export function Badge({ tone = 'accent', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(
        'e237-badge',
        tone !== 'accent' && `e237-badge--${tone}`,
        className,
      )}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  label: ReactNode;
}

export function Stat({ value, label, className, ...rest }: StatProps) {
  return (
    <div className={cx('e237-stat', className)} {...rest}>
      <span className="e237-stat__value">{value}</span>
      <span className="e237-stat__label">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionLabel                                                        */
/* ------------------------------------------------------------------ */

export type SectionLabelProps = HTMLAttributes<HTMLSpanElement>;

/** Label de section cyan en capitales (cf. maquettes). */
export function SectionLabel({ className, ...rest }: SectionLabelProps) {
  return <span className={cx('e237-section-label', className)} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* PlayerCard                                                          */
/* ------------------------------------------------------------------ */

export interface PlayerCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Pseudo du joueur (affiché en capitales). */
  name: string;
  /** Note générale (ex. 87). */
  rating: number | string;
  /** Division ou rang (ex. « Elite » ou « #128 »). */
  division?: string;
  /** Ligne secondaire libre (ville, discipline…). */
  meta?: string;
}

/**
 * Carte joueur — valorise le niveau (P12 du cahier fonctionnel).
 * Identité graphique originale ESPORT 237 HUB (exigence du dossier V4 :
 * ne pas reproduire les cartes commerciales existantes).
 */
export function PlayerCard({
  name,
  rating,
  division,
  meta,
  className,
  children,
  ...rest
}: PlayerCardProps) {
  return (
    <div className={cx('e237-player-card', className)} {...rest}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--e237-spacing-4)',
        }}
      >
        <span className="e237-player-card__rating">{rating}</span>
        {division ? <Badge tone="gold">{division}</Badge> : null}
      </div>
      <div style={{ marginTop: 'var(--e237-spacing-4)' }}>
        <div className="e237-player-card__name">{name}</div>
        {meta ? <div className="e237-player-card__meta">{meta}</div> : null}
      </div>
      {children}
    </div>
  );
}
