"use client";

import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Libellé cliquable à droite de la case. */
  label: ReactNode;
  /** Précision sous le libellé (gris, plus petit). */
  hint?: ReactNode;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/**
 * Case à cocher du design system.
 *
 * Comblait un vrai manque : l'espace d'administration posait des
 * `<input type="checkbox">` bruts avec `accent-[var(--e237-accent)]` écrit à
 * la main — donc une coche dont le rendu variait d'un navigateur à l'autre et
 * une classe utilitaire recopiée à chaque champ. Ici l'input reste le
 * contrôle réel (clavier, formulaire, lecteurs d'écran) mais il est masqué
 * visuellement : la coche est une icône Lucide sur une boîte aux tokens.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  name,
  className = "",
}: CheckboxProps) {
  const id = useId();
  return (
    <div className={`flex items-start gap-2.5 ${className}`.trim()}>
      <span className="relative grid size-[18px] shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className={`grid size-[18px] place-items-center rounded-[5px] border transition-colors peer-focus-visible:shadow-[var(--e237-ring)] ${
            checked
              ? "border-accent bg-accent text-on-accent"
              : "border-edge bg-surface text-transparent"
          } ${disabled ? "opacity-50" : ""}`}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      </span>
      <label
        htmlFor={id}
        className={`flex min-w-0 flex-col gap-0.5 text-sm leading-tight ${
          disabled ? "opacity-50" : "cursor-pointer"
        }`}
      >
        <span>{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RadioGroup                                                          */
/* ------------------------------------------------------------------ */

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Précision sous le libellé. */
  hint?: ReactNode;
  /** Valeur affichée à droite (prix, disponibilité…). */
  trailing?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  /** Libellé du groupe — lu par les lecteurs d'écran. */
  label: string;
  options: readonly RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** `card` (défaut) = options encadrées ; `inline` = pastilles alignées. */
  variant?: "card" | "inline";
  className?: string;
}

/**
 * Groupe de boutons radio.
 *
 * Remplace les `<input type="radio">` bruts de la boutique et de
 * l'administration : un seul `role="radiogroup"`, une navigation clavier
 * cohérente et zéro classe de couleur tapée à la main.
 */
export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = "card",
  className = "",
}: RadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex ${
        variant === "inline" ? "flex-wrap gap-2" : "flex-col gap-2"
      } ${className}`.trim()}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={
              variant === "inline"
                ? `chip ${selected ? "chip--on" : ""}`
                : `flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected ? "border-accent bg-accent/5" : "border-edge"
                  }`
            }
          >
            {variant === "inline" ? (
              option.label
            ) : (
              <>
                <span className="flex min-w-0 items-start gap-2.5">
                  <span
                    aria-hidden
                    className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors ${
                      selected ? "border-accent" : "border-edge"
                    }`}
                  >
                    <span
                      className={`size-2.5 rounded-full transition-colors ${
                        selected ? "bg-accent" : "bg-transparent"
                      }`}
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.hint ? (
                      <span className="text-xs text-muted">{option.hint}</span>
                    ) : null}
                  </span>
                </span>
                {option.trailing ? (
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">
                    {option.trailing}
                  </span>
                ) : null}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
