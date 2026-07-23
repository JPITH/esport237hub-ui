"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

/** Bouton maison — variantes, tailles, état loading, icônes, micro-press. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      block = false,
      icon,
      iconRight,
      disabled,
      className = "",
      children,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`btn btn--${variant} btn--${size} ${
          block ? "btn--block" : ""
        } ${className}`}
        {...rest}
      >
        {loading ? (
          <span className="ui-spinner size-4" aria-hidden />
        ) : icon ? (
          <span className="grid place-items-center [&>svg]:size-[18px]">
            {icon}
          </span>
        ) : null}
        {children}
        {iconRight && !loading ? (
          <span className="grid place-items-center [&>svg]:size-[18px]">
            {iconRight}
          </span>
        ) : null}
      </button>
    );
  },
);
Button.displayName = "Button";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

/** Bouton icône carré (36px). `label` obligatoire (accessibilité). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className = "", type = "button", children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={`icon-btn [&>svg]:size-[18px] ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
