"use client";

import { useEffect } from "react";

import { Combobox, type SelectOption } from "./pickers";
import { FilterChip } from "./nav";

/**
 * Choix du jeu — règle produit (porteur, 22/07/2026) :
 * - 1 seul jeu   → aucune sélection, on l'affiche en statique ;
 * - 2 ou 3 jeux  → boutons (chips) à sélection unique ;
 * - plus de 3    → liste déroulante avec recherche (Combobox).
 * EA Sports FC est toujours en tête et sert de choix par défaut.
 */
const FC_FIRST = ["fc27", "ea-sports-fc", "easportsfc", "fc26", "fifa"];

export function sortGamesFcFirst(options: SelectOption[]): SelectOption[] {
  return [...options].sort((a, b) => {
    const af = FC_FIRST.includes(a.value) ? 0 : 1;
    const bf = FC_FIRST.includes(b.value) ? 0 : 1;
    return af - bf || a.label.localeCompare(b.label);
  });
}

export interface GameSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function GameSelect({
  options,
  value,
  onChange,
  label = "Jeu",
  className = "",
}: GameSelectProps) {
  const sorted = sortGamesFcFirst(options);
  const first = sorted[0]?.value;

  // Défaut : EA Sports FC (premier de la liste triée).
  useEffect(() => {
    if (!value && first) onChange(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, first]);

  if (sorted.length === 0) return null;

  if (sorted.length === 1) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <span className="text-xs font-medium text-secondary">{label}</span>
        <span className="inline-flex w-fit items-center rounded-full border border-edge bg-surface px-3 py-1.5 text-sm font-medium">
          {sorted[0].label}
        </span>
      </div>
    );
  }

  if (sorted.length <= 3) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <span className="text-xs font-medium text-secondary">{label}</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
          {sorted.map((o) => (
            <FilterChip
              key={o.value}
              active={o.value === value}
              onClick={() => onChange(o.value)}
            >
              {o.label}
            </FilterChip>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Combobox
      label={label}
      options={sorted}
      value={value}
      onChange={onChange}
      placeholder="Choisir un jeu…"
      searchPlaceholder="Rechercher un jeu…"
      className={className}
    />
  );
}
