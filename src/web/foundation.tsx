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

export type SectionLabelProps = HTMLAttributes<HTMLSpanElement>;

/** Label de section cyan en capitales (cf. maquettes). */
export function SectionLabel({ className, ...rest }: SectionLabelProps) {
  return <span className={cx('e237-section-label', className)} {...rest} />;
}
