/**
 * Switch booléen — piste pilule + pouce glissant (web).
 */
'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Libellé accessible (obligatoire si pas de label visible). */
  label?: string;
  /** Libellé visible à côté du switch. */
  children?: ReactNode;
}

/** Bascule on/off en pilule, animée. */
export function Switch({
  checked,
  onChange,
  label,
  children,
  className,
  disabled,
  ...rest
}: SwitchProps) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? (typeof children === 'string' ? children : undefined)}
      disabled={disabled}
      className="e237-switch"
      onClick={() => onChange(!checked)}
      {...rest}
    >
      <span className="e237-switch__thumb" aria-hidden />
    </button>
  );

  if (!children) {
    return <span className={className}>{control}</span>;
  }

  return (
    <div
      className={cx(
        'inline-flex items-center gap-2.5 text-sm',
        disabled && 'opacity-50',
        className,
      )}
    >
      {control}
      <span className="text-primary">{children}</span>
    </div>
  );
}
