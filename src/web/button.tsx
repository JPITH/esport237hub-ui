"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
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

export interface LinkButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

/**
 * Même habillage que `Button`, rendu en `<a>`.
 *
 * Un CTA qui navigue est un lien, pas un bouton : indispensable pour les pages
 * statiques (site vitrine) où l'on veut le style du DS sans embarquer de JS.
 * Pas de `next/link` / `expo-router` ici — le DS reste agnostique du routeur.
 */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      block = false,
      icon,
      iconRight,
      className = "",
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        className={`btn btn--${variant} btn--${size} ${
          block ? "btn--block" : ""
        } ${className}`}
        {...rest}
      >
        {icon ? (
          <span className="grid place-items-center [&>svg]:size-[18px]">
            {icon}
          </span>
        ) : null}
        {children}
        {iconRight ? (
          <span className="grid place-items-center [&>svg]:size-[18px]">
            {iconRight}
          </span>
        ) : null}
      </a>
    );
  },
);
LinkButton.displayName = "LinkButton";

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
