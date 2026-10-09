import { Icon } from "../icons/generated/web";

import { Picture } from "./picture";
import { Badge } from "./foundation";
import { formatRatingAverage, ratingCountLabel } from "../lib/rating";

export interface VenueCardProps {
  id: string;
  /** Lien cible — défaut `/salles/${id}` (pas de next/link dans le DS). */
  href?: string;
  name: string;
  city: string;
  district?: string | null;
  pricePerHour?: number | null;
  isOpen?: boolean;
  imageUrl?: string | null;
  equipment?: Record<string, unknown> | null;
  /**
   * Réputation de la salle. `ratingCount` à 0 (ou `ratingAvg` nul) n'affiche
   * RIEN plutôt qu'un zéro : une salle qui vient d'ouvrir n'a pas démérité, et
   * la ranger visuellement au niveau des plus mauvaises la condamnerait sans
   * qu'un seul joueur se soit prononcé.
   */
  ratingAvg?: number | null;
  ratingCount?: number | null;
  /** Position au classement des salles, si la carte est rendue dans ce contexte. */
  rank?: number;
}

/**
 * Carte de salle : image (fallback), prix en pill, statut ouvert/fermé.
 * L'image viendra du socle médias ; en attendant, placeholder illustré.
 */
export function VenueCard({
  id,
  href,
  name,
  city,
  district,
  pricePerHour,
  isOpen,
  imageUrl,
  equipment,
  ratingAvg,
  ratingCount,
  rank,
}: VenueCardProps) {
  const consoles = Array.isArray(equipment?.consoles)
    ? (equipment!.consoles as string[])
    : [];
  const to = href ?? `/salles/${id}`;
  const rated = (ratingCount ?? 0) > 0 && ratingAvg != null;

  return (
    <a
      href={to}
      className="group flex flex-col overflow-hidden rounded-2xl border border-edge bg-surface transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-accent"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-raised">
        {imageUrl ? (
          <Picture
            src={imageUrl}
            alt={name}
            width={640}
            height={400}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted">
            <Icon name="building" size={48} className="opacity-30" strokeWidth={1.25} />
          </div>
        )}

        {rank !== undefined ? (
          <span className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-[var(--e237-media-scrim)] text-xs font-bold text-[var(--e237-on-media)]">
            {rank}
          </span>
        ) : null}

        {isOpen !== undefined ? (
          // Sur la photo : la pastille « sur image » du DS (lot R) — l'état
          // en émeraude, jamais dans l'accent des boutons.
          <Badge
            variant="on-media"
            tone={isOpen ? "success" : "neutral"}
            size="sm"
            className="absolute left-2.5 top-2.5"
          >
            <Icon name="clock" size={12} />
            {isOpen ? "Ouvert" : "Fermé"}
          </Badge>
        ) : null}

        {pricePerHour != null ? (
          <Badge variant="on-media" tone="neutral" className="absolute bottom-2.5 right-2.5">
            <span className="scoreboard">{pricePerHour}</span> FCFA/h
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold leading-tight">{name}</span>
          {rated ? (
            <span
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gold"
              title={`${formatRatingAverage(ratingAvg)} sur 5 — ${ratingCountLabel(ratingCount)}`}
            >
              <Icon name="star" size={14} filled strokeWidth={1.5} />
              {formatRatingAverage(ratingAvg)}
              <span className="font-normal text-muted">({ratingCount})</span>
            </span>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Icon name="map-pin" size={14} />
          {city}
          {district ? ` · ${district}` : ""}
        </span>
        {consoles.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {consoles.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-md bg-raised px-1.5 py-0.5 text-[11px] text-secondary"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </a>
  );
}
