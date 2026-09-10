"use client";

import { Building2, CalendarDays } from "lucide-react";

import { useDsT } from "../i18n";
import { MediaImage } from "./media-image";

/** Arrondis proposés — sous-ensemble de `MediaRounded` utile aux visuels. */
export type CoverRounded = "md" | "lg" | "xl";

export interface EventCoverProps {
  /** `event.cover_image_url` — `null` tant qu'aucune affiche n'est approuvée. */
  src?: string | null;
  /** Titre de l'évènement : sert de description accessible. */
  title: string;
  /** Ratio du cadre ; 16/9 en liste, plus haut sur la fiche. */
  ratio?: number;
  rounded?: CoverRounded;
  className?: string;
}

/**
 * Affiche d'un évènement (liste ou fiche).
 *
 * Ces enveloppes n'ajoutent aucune logique : elles figent le cadre et le
 * REPLI propre à chaque objet, pour qu'une affiche manquante ressemble
 * partout à la même chose. C'est ce vocabulaire figé (« Affiche à venir »,
 * « Photo à venir ») qui doit être partagé — le web appelait `MediaImage` à
 * la main dans chaque page.
 */
export function EventCover({
  src,
  title,
  ratio = 16 / 9,
  rounded = "md",
  className,
}: EventCoverProps) {
  const t = useDsT();
  return (
    <MediaImage
      src={src}
      alt={t("form.cover.eventAlt", { title })}
      ratio={ratio}
      rounded={rounded}
      fallbackIcon={<CalendarDays strokeWidth={1.25} aria-hidden />}
      fallbackLabel={t("form.cover.eventFallback")}
      className={className}
    />
  );
}

export interface VenuePhotoProps {
  /** URL déjà résolue par l'API (`photo_urls[i]`). */
  src?: string | null;
  /** Nom de la salle : sert de description accessible. */
  name: string;
  ratio?: number;
  rounded?: CoverRounded;
  className?: string;
}

/** Photo d'une salle partenaire. */
export function VenuePhoto({
  src,
  name,
  ratio = 16 / 9,
  rounded = "md",
  className,
}: VenuePhotoProps) {
  const t = useDsT();
  return (
    <MediaImage
      src={src}
      alt={t("form.cover.venueAlt", { name })}
      ratio={ratio}
      rounded={rounded}
      fallbackIcon={<Building2 strokeWidth={1.25} aria-hidden />}
      fallbackLabel={t("form.cover.venueFallback")}
      className={className}
    />
  );
}

export interface VenuePhotoStripProps {
  photos: readonly string[];
  name: string;
  /** Largeur d'une vignette du bandeau (défaut 220 px). */
  width?: number;
  className?: string;
}

/**
 * Bandeau horizontal des photos d'une salle. Sans photo, on montre UN cadre
 * de repli plutôt que rien : le joueur comprend que l'emplacement existe.
 */
export function VenuePhotoStrip({
  photos,
  name,
  width = 220,
  className = "",
}: VenuePhotoStripProps) {
  const t = useDsT();
  if (photos.length === 0) {
    return <VenuePhoto name={name} className={className} />;
  }
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 ${className}`.trim()}
      role="group"
      aria-label={t("form.cover.venueStripLabel", { name })}
    >
      {photos.map((url) => (
        <div key={url} className="shrink-0" style={{ width }}>
          <VenuePhoto src={url} name={name} />
        </div>
      ))}
    </div>
  );
}
