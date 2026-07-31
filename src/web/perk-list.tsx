"use client";

import { Check, Minus } from "lucide-react";

export interface PerkListProps {
  /** Lignes à afficher ; une liste vide ne rend rien. */
  items: readonly string[] | null | undefined;
  /**
   * `perk` (défaut) = ce que la formule apporte (coche verte) ;
   * `limitation` = ce qu'elle n'apporte pas (tiret orange).
   */
  variant?: "perk" | "limitation";
  className?: string;
}

/**
 * Liste d'avantages ou de restrictions.
 *
 * Le même `<ul>` avec `Check`/`Minus` et les classes
 * « mt-0.5 size-3.5 shrink-0 text-success » existait en CINQ exemplaires
 * (tier-picker, tier-manager ×2, subscription-plans, abonnements-tab). Les
 * icônes restent des icônes Lucide, jamais de puce typographique.
 */
export function PerkList({
  items,
  variant = "perk",
  className = "",
}: PerkListProps) {
  if (!items || items.length === 0) return null;
  const perk = variant === "perk";
  const Icon = perk ? Check : Minus;

  return (
    <ul className={`flex flex-col gap-1 ${className}`.trim()}>
      {items.map((item, i) => (
        <li
          key={`${i}-${item}`}
          className={`flex items-start gap-1.5 text-xs ${
            perk ? "text-secondary" : "text-muted"
          }`}
        >
          <Icon
            aria-hidden
            className={`mt-0.5 size-3.5 shrink-0 ${
              perk ? "text-success" : "text-warning"
            }`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
