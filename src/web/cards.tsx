"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Package,
  Shirt,
  Store,
} from "lucide-react";

import {
  competitionStatusLabel,
  competitionStatusTone,
  competitionFormatLabel,
  eventTypeLabel,
  eventTypeTone,
  ticketStatusMeta,
} from "../lib/catalog";
import { formatXaf, priceOrFreeLabel } from "../lib/money";
import { Badge, Card } from "./foundation";
import { MediaImage } from "./media-image";
import { PerkList } from "./perk-list";

/**
 * Enveloppe cliquable optionnelle.
 *
 * Les cartes du design system ne connaissent pas le routeur : passer `href`
 * rend une ancre native, ne rien passer rend un simple bloc que
 * l'application peut envelopper dans son propre `<Link>`.
 */
function Clickable({
  href,
  onClick,
  children,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (href) {
    return (
      <a href={href} onClick={onClick} className={`block ${className}`.trim()}>
        {children}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`block w-full text-left ${className}`.trim()}
      >
        {children}
      </button>
    );
  }
  return <div className={className || undefined}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* EventCard                                                           */
/* ------------------------------------------------------------------ */

export interface EventCardProps {
  /** Lien vers la fiche ; absent = l'application enveloppe elle-même. */
  href?: string;
  onClick?: () => void;
  title: string;
  /** Type d'évènement brut (`tournament`, `meetup`…) — libellé et ton dérivés. */
  type: string;
  gameName?: string | null;
  /** Date déjà mise en forme par l'appelant. */
  dateLabel: string;
  /** Salle ou ville. */
  placeLabel?: string | null;
  capacity?: number | null;
  /** Prix déjà calculé (« Gratuit », « À partir de 2 000 FCFA »…). */
  priceLabel: string;
  /** Colore le prix en accent (évènement payant). */
  isPaid?: boolean;
  className?: string;
}

/**
 * Carte d'un évènement en liste : type + jeu, titre, prix, date, lieu,
 * capacité. Le natif l'avait déjà isolée sous ce nom ; le web la redéfinissait
 * en ligne dans la page.
 */
export function EventCard({
  href,
  onClick,
  title,
  type,
  gameName,
  dateLabel,
  placeLabel,
  capacity,
  priceLabel,
  isPaid = false,
  className = "",
}: EventCardProps) {
  return (
    <Clickable href={href} onClick={onClick} className={className}>
      <Card className="flex flex-col gap-2 transition-colors hover:border-accent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={eventTypeTone(type)}>{eventTypeLabel(type)}</Badge>
              {gameName ? <Badge tone="neutral">{gameName}</Badge> : null}
            </div>
            <span className="font-semibold">{title}</span>
          </div>
          <span
            className={`shrink-0 text-sm font-bold tabular-nums ${
              isPaid ? "text-accent" : "text-secondary"
            }`}
          >
            {priceLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {dateLabel}
          </span>
          {placeLabel ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {placeLabel}
            </span>
          ) : null}
          {capacity ? <span>· {capacity} places</span> : null}
        </div>
      </Card>
    </Clickable>
  );
}

/* ------------------------------------------------------------------ */
/* CompetitionCard                                                     */
/* ------------------------------------------------------------------ */

export interface CompetitionCardProps {
  href?: string;
  onClick?: () => void;
  title: string;
  /** `upcoming` / `ongoing` / `finished`. */
  status: string;
  /** `single_elimination`, `swiss`… — libellé FR dérivé. */
  format: string;
  isOnline: boolean;
  city?: string | null;
  /** Date de début déjà mise en forme ; absente = non annoncée. */
  dateLabel?: string | null;
  venueName?: string | null;
  className?: string;
}

/** Carte d'une compétition en liste — jumelle de l'écran mobile. */
export function CompetitionCard({
  href,
  onClick,
  title,
  status,
  format,
  isOnline,
  city,
  dateLabel,
  venueName,
  className = "",
}: CompetitionCardProps) {
  return (
    <Clickable href={href} onClick={onClick} className={className}>
      <Card className="flex flex-col gap-2 transition-colors hover:border-accent">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{title}</span>
          <Badge tone={competitionStatusTone(status)}>
            {competitionStatusLabel(status)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span>{competitionFormatLabel(format)}</span>
          <span>· {isOnline ? "En ligne" : (city ?? "En salle")}</span>
          {dateLabel ? <span>· {dateLabel}</span> : null}
          {venueName ? <span>· {venueName}</span> : null}
        </div>
      </Card>
    </Clickable>
  );
}

/* ------------------------------------------------------------------ */
/* ProductCard                                                         */
/* ------------------------------------------------------------------ */

export interface ProductCardProps {
  href?: string;
  onClick?: () => void;
  name: string;
  description?: string | null;
  priceXaf: number;
  /** `digital` (livraison automatique) ou `physical` (retrait en salle). */
  kind: string;
  imageUrl?: string | null;
  className?: string;
}

/**
 * Carte d'un produit de la boutique — famille `VenueCard` / `EventCard`.
 * Le repli d'image dépend du type : cadeau pour un bien numérique, tee-shirt
 * pour un bien physique.
 */
export function ProductCard({
  href,
  onClick,
  name,
  description,
  priceXaf,
  kind,
  imageUrl,
  className = "",
}: ProductCardProps) {
  const digital = kind === "digital";
  return (
    <Clickable href={href} onClick={onClick} className={`h-full ${className}`.trim()}>
      <Card className="flex h-full flex-col gap-3 transition-colors hover:border-accent/40">
        <div className="relative">
          <MediaImage
            src={imageUrl}
            alt={name}
            ratio={1}
            rounded="lg"
            fallbackIcon={
              digital ? (
                <Gift strokeWidth={1.25} aria-hidden />
              ) : (
                <Shirt strokeWidth={1.25} aria-hidden />
              )
            }
            fallbackLabel="Visuel à venir"
          />
          <Badge
            tone={digital ? "cyan" : "neutral"}
            className="absolute right-2 top-2"
          >
            {digital ? "Numérique" : "Physique"}
          </Badge>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-semibold">{name}</span>
          <p className="line-clamp-2 text-sm text-secondary">
            {description || "—"}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black tabular-nums text-accent">
            {formatXaf(priceXaf)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Package className="size-3.5" aria-hidden /> Voir
          </span>
        </div>
      </Card>
    </Clickable>
  );
}

/* ------------------------------------------------------------------ */
/* TicketCard                                                          */
/* ------------------------------------------------------------------ */

export interface TicketCardProps {
  eventTitle: string;
  /** Type d'évènement brut — libellé FR dérivé. */
  eventType: string;
  /** Lien vers la fiche de l'évènement (titre cliquable). */
  eventHref?: string;
  dateLabel: string;
  city?: string | null;
  quantity: number;
  amountXaf: number;
  /** `paid`, `reserved`, `cancelled`, `refunded`. */
  status: string;
  /** Billet déjà scanné à l'entrée. */
  admitted?: boolean;
  /** Date de l'admission, déjà mise en forme. */
  checkedInAtLabel?: string | null;
  /**
   * Le QR lui-même. Le design system ne fabrique pas le code (l'encodage
   * dépend d'une bibliothèque par plateforme) : il l'accueille dans son
   * cadre — voir `QrFrame`.
   */
  qr?: ReactNode;
  className?: string;
}

/** Carte « Mes billets » : évènement, statut, quantité, montant, QR d'entrée. */
export function TicketCard({
  eventTitle,
  eventType,
  eventHref,
  dateLabel,
  city,
  quantity,
  amountXaf,
  status,
  admitted = false,
  checkedInAtLabel,
  qr,
  className = "",
}: TicketCardProps) {
  const meta = ticketStatusMeta(status);
  const title = (
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-semibold">{eventTitle}</span>
      <span className="text-xs text-muted">{eventTypeLabel(eventType)}</span>
    </span>
  );

  return (
    <Card className={`flex flex-col gap-3 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        {eventHref ? (
          <a href={eventHref} className="min-w-0 hover:text-accent">
            {title}
          </a>
        ) : (
          title
        )}
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {admitted ? <Badge tone="accent">Admis</Badge> : null}
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" aria-hidden />
          {dateLabel}
        </span>
        {city ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {city}
          </span>
        ) : null}
        <span>
          · {quantity} billet{quantity > 1 ? "s" : ""}
        </span>
        <span className="ml-auto font-semibold tabular-nums text-secondary">
          {priceOrFreeLabel(amountXaf)}
        </span>
      </div>

      {qr ? (
        <div className="flex items-center gap-4 border-t border-edge pt-3">
          {qr}
          <div className="flex flex-col gap-1 text-sm">
            {admitted ? (
              <>
                <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Déjà admis à l’entrée
                </span>
                {checkedInAtLabel ? (
                  <span className="text-xs text-muted">
                    Ce QR a déjà servi le {checkedInAtLabel}.
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <span className="font-medium text-secondary">
                  Présente ce QR à l’entrée
                </span>
                <span className="text-xs text-muted">
                  Le personnel le scanne pour valider ton accès.
                </span>
              </>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* SubscriptionCard                                                    */
/* ------------------------------------------------------------------ */

export interface SubscriptionCardProps {
  venueName: string;
  planName: string;
  /** Abonnement encore consommable (heures restantes et non périmé). */
  usable: boolean;
  /** Libellé d'état quand l'abonnement n'est plus utilisable. */
  statusLabel: string;
  /** Ex. « 4 h restantes ». */
  remainingLabel: string;
  /** Ex. « Jusqu’au 12 août » ; absent = sans péremption. */
  expiresLabel?: string | null;
  city?: string | null;
  pricePaidXaf: number;
  perks?: readonly string[] | null;
  className?: string;
}

/** Carte d'un abonnement de salle souscrit par le joueur. */
export function SubscriptionCard({
  venueName,
  planName,
  usable,
  statusLabel,
  remainingLabel,
  expiresLabel,
  city,
  pricePaidXaf,
  perks,
  className = "",
}: SubscriptionCardProps) {
  return (
    <Card className={`flex flex-col gap-2 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Store className="size-4 text-accent" aria-hidden />
            {venueName}
          </span>
          <span className="text-xs text-muted">{planName}</span>
        </div>
        <Badge tone={usable ? "accent" : "neutral"}>
          {usable ? "Utilisable" : statusLabel}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted" aria-hidden />
          {remainingLabel}
        </span>
        <span>{expiresLabel ?? "Sans péremption"}</span>
        {city ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted" aria-hidden />
            {city}
          </span>
        ) : null}
        <span className="tabular-nums">Payé {formatXaf(pricePaidXaf)}</span>
      </div>

      <PerkList items={perks} />
    </Card>
  );
}
