"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeft, BadgeCheck } from "lucide-react";
import type { DuelStatus } from "@esport237hub/types";

import { DUEL_STATUS_META } from "../lib/duel-status";
import { useDsT } from "../i18n";
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
  const t = useDsT();
  const meta = DUEL_STATUS_META[status];
  return (
    <Badge tone={meta?.tone ?? "neutral"}>
      {meta ? t(meta.labelKey) : status}
    </Badge>
  );
}

export function Spinner({ label }: { label?: string }) {
  const t = useDsT();
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-secondary">
      <span className="ui-spinner size-4 text-accent" />
      {label ?? t("ui.loading")}
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
  const t = useDsT();
  return (
    <BadgeCheck
      aria-label={t("ui.player.verified")}
      className={`inline-block size-4 shrink-0 text-cyan ${className}`}
    />
  );
}

/** @deprecated Préférer l'import depuis `./avatar` — ré-export de compat. */
export { Avatar, AvatarGroup, toAvatarSize } from './avatar';
export type { AvatarProps, AvatarGroupProps, AvatarPerson, AvatarSize } from './avatar';

/**
 * Locale d'affichage : celle CHOISIE dans l'app, pas celle du navigateur.
 *
 * Le dashboard pose `<html lang>` depuis le cookie `e237_locale` (voir
 * `apps/web/src/app/layout.tsx`) : c'est donc la source de vérité. La lire ici
 * évite de faire passer la locale en paramètre par la centaine d'appels à
 * `formatDate`, et fait tomber d'un coup le « 10 sept., 11:19 » qui s'affichait
 * en anglais parce que le format était figé sur `fr-FR`.
 *
 * `document` est absent au rendu serveur : on retombe alors sur le français,
 * qui est la langue par défaut du produit.
 */
function displayLocale(): string {
  if (typeof document === "undefined") return "fr-FR";
  const lang = document.documentElement.lang;
  return lang && lang.length > 1 ? lang : "fr-FR";
}

export function formatDate(value: string | null, locale?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(locale ?? displayLocale(), {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
