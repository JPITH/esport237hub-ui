"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button, IconButton } from "./button";
import { Input } from "./fields";

export interface StringListFieldProps {
  /** Libellé du groupe (« Avantages », « Restrictions »…). */
  label: string;
  placeholder?: string;
  values: readonly string[];
  onChange: (next: string[]) => void;
  /** Nombre maximum de lignes (défaut 12). */
  max?: number;
  /** Longueur maximale d'une ligne (défaut 120). */
  maxLength?: number;
  /** Libellé du bouton d'ajout (défaut « Ajouter »). */
  addLabel?: string;
  className?: string;
}

/**
 * Éditeur de liste de courtes lignes de texte (avantages, restrictions…).
 *
 * `LinesEditor` (tier-manager) et `PerksEditor` (subscription-plans) étaient
 * le même composant recopié : seules différaient les constantes `max` (12 vs
 * 10) et `maxLength` (120 vs 60), désormais des props.
 */
export function StringListField({
  label,
  placeholder,
  values,
  onChange,
  max = 12,
  maxLength = 120,
  addLabel = "Ajouter",
  className = "",
}: StringListFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <span className="text-xs font-medium text-secondary">{label}</span>
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder={placeholder}
            maxLength={maxLength}
            value={value}
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <IconButton
            label="Retirer cette ligne"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            <Trash2 />
          </IconButton>
        </div>
      ))}
      {values.length < max ? (
        <Button
          variant="ghost"
          size="sm"
          icon={<Plus />}
          className="w-fit"
          onClick={() => onChange([...values, ""])}
        >
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}
