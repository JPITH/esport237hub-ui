"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons/generated/web";

import type { Tone } from "../lib/tone";

/** Icône par défaut de chaque ton — jamais d'emoji (règle DESIGN.md). */
const DEFAULT_ICON: Record<Tone, ReactNode> = {
  accent: <Icon name="check-circle" />,
  cyan: <Icon name="info" />,
  success: <Icon name="check-circle" />,
  info: <Icon name="info" />,
  gold: <Icon name="lightbulb" />,
  danger: <Icon name="alert-triangle" />,
  warning: <Icon name="alert-triangle" />,
  neutral: <Icon name="info" />,
};

/**
 * Teintes : fond « subtle » et liseré du ton (`.e237-notice--<ton>`, feuille
 * du design system). Jusqu'au lot R (09/10/2026) c'était un voile translucide
 * (`bg-x/10 border-x/40`) : posé sur une carte ou sur la page, le même
 * encart changeait de couleur — le porteur l'a relevé (« souvent les pills
 * sont translucides, souvent pas »). Mêmes couples que `Badge`, tous AA.
 */
export interface NoticeProps {
  /** Teinte sémantique — `danger` reproduit exactement l'`ErrorNote`. */
  tone?: Tone;
  /** Icône (`<Icon>` du jeu G-HUB) ; `null` pour aucune icône. Défaut : icône du ton. */
  icon?: ReactNode | null;
  /** Titre court en gras, au-dessus du corps (facultatif). */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Encart d'information teinté — généralise l'`ErrorNote` à tous les tons.
 *
 * Le motif « rounded-md border border-X/40 bg-X/10 px-3 py-2 text-sm text-X »
 * était recopié treize fois dans `apps/web` (inscription, évènements, salle,
 * abonnements, classement, administration…), à chaque fois avec une nuance de
 * padding différente. Un seul composant, deux thèmes garantis : toutes les
 * teintes passent par les variables `--e237-*`.
 */
export function Notice({
  tone = "cyan",
  icon,
  title,
  children,
  className = "",
}: NoticeProps) {
  const resolved = icon === null ? null : (icon ?? DEFAULT_ICON[tone]);
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={`e237-notice e237-notice--${tone} ${className}`.trim()}
    >
      {resolved ? (
        <span className="e237-notice__icon">{resolved}</span>
      ) : null}
      <span className="e237-notice__text">
        {title ? <span className="e237-notice__title">{title}</span> : null}
        <span>{children}</span>
      </span>
    </div>
  );
}
