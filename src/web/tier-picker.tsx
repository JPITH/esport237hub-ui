"use client";

import { Badge } from "./foundation";
import { PerkList } from "./perk-list";

export interface TierOption {
  id: string;
  name: string;
  /** Prix déjà mis en forme (« 2 000 FCFA », « Gratuit »). */
  priceLabel: string;
  /** Description courte, montrée seulement sur la catégorie choisie. */
  description?: string | null;
  /** Ex. « 12 places restantes », « Complet » ; absent = rien à signaler. */
  availabilityLabel?: string | null;
  /** Catégorie encore achetable ; sinon grisée et non sélectionnable. */
  buyable: boolean;
  perks?: readonly string[] | null;
  limitations?: readonly string[] | null;
}

export interface TierPickerProps {
  tiers: readonly TierOption[];
  value: string | null;
  onChange: (tierId: string) => void;
  /** Libellé du groupe (accessibilité) — défaut « Catégorie de billet ». */
  label?: string;
  className?: string;
}

/**
 * Choix d'une catégorie de billet.
 *
 * Divulgation progressive : la liste ne montre que nom, prix et
 * disponibilité. Avantages et restrictions n'apparaissent que sur la
 * catégorie sélectionnée — l'acheteur voit ce qu'il prend sans lire six
 * colonnes d'un coup.
 *
 * Le composant ne connaît plus le type `TicketTier` de l'application : prix,
 * disponibilité et achetabilité arrivent DÉJÀ calculés.
 */
export function TierPicker({
  tiers,
  value,
  onChange,
  label = "Catégorie de billet",
  className = "",
}: TierPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex flex-col gap-2 ${className}`.trim()}
    >
      {tiers.map((tier) => {
        const selected = tier.id === value;
        const hasDetails =
          Boolean(tier.perks?.length) || Boolean(tier.limitations?.length);
        return (
          <div
            key={tier.id}
            className={`rounded-xl border p-3 transition-colors ${
              selected ? "border-accent bg-accent/5" : "border-edge"
            } ${tier.buyable ? "" : "opacity-60"}`}
          >
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!tier.buyable}
              onClick={() => onChange(tier.id)}
              className="flex w-full items-start justify-between gap-3 text-left disabled:cursor-not-allowed"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-semibold">
                  {tier.name}
                </span>
                {tier.availabilityLabel ? (
                  <span className="w-fit">
                    <Badge tone={tier.buyable ? "neutral" : "danger"}>
                      {tier.availabilityLabel}
                    </Badge>
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-accent">
                {tier.priceLabel}
              </span>
            </button>

            {selected ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-edge pt-3">
                {tier.description ? (
                  <p className="text-xs text-secondary">{tier.description}</p>
                ) : null}
                <PerkList items={tier.perks} />
                <PerkList items={tier.limitations} variant="limitation" />
                {!hasDetails ? (
                  <p className="text-xs text-muted">
                    Aucun avantage ni restriction annoncés pour cette catégorie.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
