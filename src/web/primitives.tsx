"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons/generated/web";
import type { DuelStatus } from "@esport237hub/types";

import { DUEL_STATUS_META } from "../lib/duel-status";
import { useDsT } from "../i18n";
import { Badge } from "./foundation";

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
      <Icon name="arrow-left" size={16} />
      {children}
    </a>
  );
}

/**
 * @deprecated Utiliser `PageLayout` (`./page-layout`).
 *
 * Conteneur de page d'AVANT le lot R (09/10/2026) : trois largeurs
 * (`wide` 1 600 px, `detail` 1 200 px, `readable` 760 px) — d'où « toutes les
 * pages n'ont pas la même min width » (retour du porteur). Il rend désormais
 * le conteneur UNIQUE du web (`.e237-page`) quelle que soit la largeur
 * demandée : les pages pas encore migrées ont déjà la même largeur que les
 * autres. `full` est la seule variante qui demeure (consoles, plateaux).
 */
export function PageContainer({
  width = "wide",
  className = "",
  children,
}: {
  width?: "wide" | "detail" | "readable" | "full";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`e237-page ${width === "full" ? "e237-page--full" : ""} ${className}`.trim()}
    >
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
    <div className="e237-notice e237-notice--danger" role="alert">
      <span className="e237-notice__icon">
        <Icon name="alert-triangle" size={16} />
      </span>
      <span className="e237-notice__text">{message}</span>
    </div>
  );
}

/** Marque « joueur vérifié » (icône G-HUB `badge-check`). */
/**
 * Badge « joueur vérifié » (identité confirmée en salle partenaire) — LE seul
 * du produit (08/10/2026) : le web et le mobile avaient chacun leur copie, en
 * `success`, pendant que celui-ci était en `cyan` — la même marque, deux
 * couleurs. Vérifié est un ÉTAT acquis : émeraude `success`, jamais l'accent
 * ni le cyan (« en direct ») — DESIGN.md, couches 2 et 3.
 */
export function VerifiedMark({ className = "" }: { className?: string }) {
  const t = useDsT();
  return (
    <Icon
      name="badge-check"
      accessibilityLabel={t("ui.player.verified")}
      className={`inline-block size-4 shrink-0 text-success ${className}`.trim()}
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
