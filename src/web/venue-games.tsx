"use client";

import { Gamepad2 } from "lucide-react";

/** Un jeu de l'inventaire d'une salle — forme rendue par `GET /venues/:id`. */
export interface VenueGameItem {
  id: string;
  slug: string;
  name: string;
  /** Vrai si la plateforme ouvre les duels classés sur cette discipline. */
  duels_open: boolean;
}

export interface VenueGameListProps {
  items?: readonly VenueGameItem[] | null;
  /** Rendu quand la salle n'a rien déclaré (défaut : rien). */
  emptyLabel?: string;
  className?: string;
}

/**
 * Les jeux réellement disponibles dans une salle, chacun disant s'il ouvre un
 * duel classé ou non.
 *
 * Deux libertés se croisent ici et il faut que le joueur les distingue d'un
 * coup d'œil : la salle liste ce qu'elle a sous la main, la plateforme décide
 * seule où le classement s'applique. Un lieu peut donc proposer Tekken 8 sans
 * qu'aucun duel n'y soit possible — le dire franchement vaut mieux que de
 * masquer la ligne, sinon le joueur croit l'offre plus pauvre qu'elle n'est.
 */
export function VenueGameList({
  items,
  emptyLabel,
  className = "",
}: VenueGameListProps) {
  if (!items || items.length === 0) {
    return emptyLabel ? (
      <p className="text-xs text-muted">{emptyLabel}</p>
    ) : null;
  }

  return (
    <ul className={`flex flex-col divide-y divide-edge ${className}`.trim()}>
      {items.map((game) => (
        <li
          key={game.id}
          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Gamepad2
              aria-hidden
              className="size-4 shrink-0 text-muted"
              strokeWidth={1.75}
            />
            <span className="truncate text-sm">{game.name}</span>
          </span>
          <span
            className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              game.duels_open
                ? "bg-accent/15 text-accent"
                : "bg-raised text-muted"
            }`}
          >
            {game.duels_open ? "Duels ouverts" : "Sur place"}
          </span>
        </li>
      ))}
    </ul>
  );
}
