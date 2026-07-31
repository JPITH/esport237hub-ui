"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeft, BadgeCheck } from "lucide-react";
import type { DuelStatus } from "@esport237hub/types";

import { DUEL_STATUS_META } from "../lib/duel-status";
import { Badge, SectionLabel } from "./foundation";

/** Lien de retour avec chevron — placé en haut à gauche des pages. */
export function BackLink({
  href,
  children = "Retour",
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex w-fit items-center gap-1.5 rounded-md py-1 text-sm text-secondary transition-colors hover:text-accent"
    >
      <ArrowLeft className="size-4" />
      {children}
    </a>
  );
}

/** En-tête de page cohérent : back top-left, eyebrow, titre, actions à droite. */
export function PageHeader({
  section,
  title,
  backHref,
  backLabel,
  children,
}: {
  section: string;
  title: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {backHref ? <BackLink href={backHref}>{backLabel}</BackLink> : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <SectionLabel>{section}</SectionLabel>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Conteneur de page — deux tiers de largeur.
 * - `wide` (défaut) : consoles, listes, tableaux de bord → remplit le desktop.
 * - `readable` : formulaires et pages de lecture → longueur de ligne confortable.
 */
export function PageContainer({
  width = "wide",
  className = "",
  children,
}: {
  width?: "wide" | "readable";
  className?: string;
  children: ReactNode;
}) {
  const max = width === "readable" ? "max-w-[760px]" : "max-w-[1440px]";
  return (
    <div className={`mx-auto flex w-full flex-col gap-6 ${max} ${className}`}>
      {children}
    </div>
  );
}

export function DuelStatusBadge({ status }: { status: DuelStatus }) {
  const meta = DUEL_STATUS_META[status];
  return <Badge tone={meta?.tone ?? "neutral"}>{meta?.label ?? status}</Badge>;
}

export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-secondary">
      <span className="ui-spinner size-4 text-accent" />
      {label}
    </div>
  );
}

/** Bloc squelette (shimmer) — chargement des listes/cartes. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`ui-skeleton ${className}`} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-edge p-8 text-center text-sm text-secondary">
      {children}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
      <AlertTriangle className="size-4 shrink-0" />
      {message}
    </div>
  );
}

/** Marque « joueur vérifié » (icône Lucide BadgeCheck). */
export function VerifiedMark({ className = "" }: { className?: string }) {
  return (
    <BadgeCheck
      aria-label="Joueur vérifié"
      className={`inline-block size-4 shrink-0 text-cyan ${className}`}
    />
  );
}

/** @deprecated Préférer l'import depuis `./avatar` — ré-export de compat. */
export { Avatar, AvatarGroup, toAvatarSize } from './avatar';
export type { AvatarProps, AvatarGroupProps, AvatarPerson, AvatarSize } from './avatar';

export function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
