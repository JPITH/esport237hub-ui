"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons/generated/web";
import {
  formatAppDate,
  localeTag,
  type AppDateStyle,
  type DuelStatus,
  type DuelStatusView,
} from "@esport237hub/types";

import { DUEL_STATUS_META } from "../lib/duel-status";
import { useDsT } from "../i18n";
import { dsLocale } from "../i18n/store";
import { Button } from "./button";
import { Badge } from "./foundation";
import { ButtonLink } from "./page-layout";

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

/**
 * Pastille du statut d'un duel. Avec `view` (`duelStatusView`, vu du joueur
 * connecté), elle dit « Défi reçu » au destinataire et « Défi envoyé » à
 * l'auteur du même défi ; sans, le libellé générique (salle, administration).
 */
export function DuelStatusBadge({
  status,
  view,
}: {
  status: DuelStatus;
  view?: Pick<DuelStatusView, "labelKey" | "tone"> | null;
}) {
  const t = useDsT();
  const meta = view ?? DUEL_STATUS_META[status];
  return (
    <Badge tone={meta?.tone ?? "neutral"}>
      {meta ? t(meta.labelKey) : status}
    </Badge>
  );
}

/**
 * Chargement d'un BLOC sans forme connue (« Chargement… »). Gris discret
 * (`text-muted`) : l'accent est réservé aux gestes (DESIGN.md), et un rond
 * vert qui tourne se lisait comme un bouton (audit web WA5). Jamais dans un
 * `Button` : le bouton a son propre état (`loading`). Pour des DONNÉES dont
 * on connaît la forme (liste, carte), préférer `Skeleton`.
 */
export function Spinner({ label }: { label?: string }) {
  const t = useDsT();
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-muted" role="status">
      <span className="ui-spinner size-4 text-muted" aria-hidden />
      {label ?? t("ui.loading")}
    </div>
  );
}

/** Bloc squelette (shimmer) — chargement des listes/cartes. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`ui-skeleton ${className}`} />;
}

/**
 * Un geste proposé par un état (vide, erreur) : « Trouver un adversaire »,
 * « Effacer les filtres ». Lien (`href`, via le lien du routeur posé par
 * `DsLinkProvider`) ou action (`onClick`). Jumeau web du `StateAction` natif
 * (`onPress` y devient `onClick`/`href`).
 */
export interface StateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Pictogramme avant le libellé. */
  icon?: ReactNode;
}

function StateActionButton({
  action,
  variant = "secondary",
}: {
  action: StateAction;
  variant?: "secondary" | "ghost";
}) {
  if (action.href) {
    return (
      <ButtonLink href={action.href} variant={variant} size="sm" icon={action.icon}>
        {action.label}
      </ButtonLink>
    );
  }
  return (
    <Button variant={variant} size="sm" icon={action.icon} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export interface EmptyStateProps {
  children: ReactNode;
  /**
   * La sortie d'une liste vide (audit web WJ17/WA15 : ~15 vides joueur et
   * 32/32 vides admin n'en avaient pas) : « Trouver un adversaire »,
   * « Effacer les filtres ». Un seul geste.
   */
  action?: StateAction;
}

export function EmptyState({ children, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-edge p-8 text-center text-sm text-secondary">
      {children}
      {action ? (
        <div className="mt-4 flex justify-center">
          <StateActionButton action={action} />
        </div>
      ) : null}
    </div>
  );
}

export interface ErrorNoteProps {
  /** Ce qui s'est passé, en clair (`friendlyError` côté app). */
  message: string;
  /** Relance l'action ou la lecture : un bouton « Réessayer » dans l'encart. */
  onRetry?: () => void;
  /** Libellé du bouton ; défaut « Réessayer » (`ui.retry`). */
  retryLabel?: string;
  /** La relance est en cours : le bouton se verrouille. */
  retrying?: boolean;
}

/**
 * Encart d'erreur EN LIGNE (sous un formulaire, dans une fenêtre).
 *
 * Audit web du 15/10/2026 (WJ9) : `onRetry` pose le « Réessayer » dans
 * l'encart, comme le natif ; trois façons de réessayer coexistaient
 * (`RetryNote`, `ErrorNote` + un bouton à la main, rien du tout). Pour un
 * bloc ou un écran qui n'a pas pu se CHARGER : `LoadError`.
 */
export function ErrorNote({ message, onRetry, retryLabel, retrying }: ErrorNoteProps) {
  const t = useDsT();
  return (
    <div className="e237-notice e237-notice--danger" role="alert">
      <span className="e237-notice__icon">
        <Icon name="alert-triangle" size={16} />
      </span>
      <span className="e237-notice__text">{message}</span>
      {onRetry ? (
        <Button
          variant="ghost"
          size="sm"
          className="e237-notice__action"
          loading={retrying}
          onClick={onRetry}
        >
          {retryLabel ?? t("ui.retry")}
        </Button>
      ) : null}
    </div>
  );
}

export interface LoadErrorProps {
  /** Ce qui s'est passé, en clair (l'`error` de `useApiQuery` l'est déjà). */
  message: string;
  /** Ce qui n'a pas pu être lu, en titre (« la file des salles ») ; facultatif. */
  title?: ReactNode;
  /** Relance la lecture (le `retry` de `useApiQuery`). */
  onRetry?: () => void;
  retrying?: boolean;
  /** Une autre sortie que « Réessayer » : revenir, ouvrir un autre écran. */
  action?: StateAction;
}

/**
 * Le bloc (ou l'écran) n'a pas pu se CHARGER : à la place du contenu, ce
 * qui s'est passé et quoi faire ensuite. Jamais une impasse : « Réessayer »
 * relance la lecture, `action` offre une autre sortie. Remplace `RetryNote`
 * (web) et `LoadFailure` (admin), qui n'en sont plus que des raccourcis.
 *
 * @example
 * if (q.error) return <LoadError message={q.error} onRetry={q.retry} />;
 */
export function LoadError({ message, title, onRetry, retrying, action }: LoadErrorProps) {
  const t = useDsT();
  return (
    <div className="flex flex-col items-start gap-2" role="alert">
      <div className="e237-notice e237-notice--danger">
        <span className="e237-notice__icon">
          <Icon name="alert-triangle" size={16} />
        </span>
        <span className="e237-notice__text">
          {title ? <span className="e237-notice__title">{title}</span> : null}
          <span>{message}</span>
        </span>
      </div>
      {onRetry || action ? (
        <div className="flex flex-wrap gap-2">
          {onRetry ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="rotate-cw" />}
              loading={retrying}
              onClick={onRetry}
            >
              {t("ui.retry")}
            </Button>
          ) : null}
          {action ? <StateActionButton action={action} variant="ghost" /> : null}
        </div>
      ) : null}
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
 * LE formateur de dates du web (audit web du 15/10/2026, WA11).
 *
 * - la langue CHOISIE dans l'app (`dsLocale`, posée par le provider, sinon
 *   `<html lang>`), jamais `fr-FR` en dur ;
 * - le fuseau du PRODUIT (`Africa/Douala`), pas celui du poste : un admin en
 *   déplacement et le rendu serveur (UTC) lisent la même heure que la salle ;
 * - une date absente rend une chaîne VIDE, jamais « — ».
 *
 * `style` : `dateTime` « 05 oct., 14:30 » (défaut), `date` « 5 oct. 2026 »,
 * `time` « 14:30 », `dayTime` « sam. 11 oct., 15:00 », `precise`
 * « 05/10/2026 14:30:12 » (journaux). Règle pure : `formatAppDate`
 * (`packages/types/src/time.ts`).
 */
export function formatDate(
  value: string | null | undefined,
  style: AppDateStyle = "dateTime",
): string {
  return formatAppDate(value, localeTag(dsLocale()), style);
}

export type { AppDateStyle };
