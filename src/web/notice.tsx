"use client";

import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";

import type { Tone } from "../lib/tone";

/** Icône par défaut de chaque ton — jamais d'emoji (règle DESIGN.md). */
const DEFAULT_ICON: Record<Tone, ReactNode> = {
  accent: <CheckCircle2 aria-hidden />,
  cyan: <Info aria-hidden />,
  gold: <Lightbulb aria-hidden />,
  danger: <AlertTriangle aria-hidden />,
  warning: <AlertTriangle aria-hidden />,
  neutral: <Info aria-hidden />,
};

/** Classes de teinte — bordure 40 %, fond 10 %, texte plein (parité native). */
const TONE_CLASS: Record<Tone, string> = {
  accent: "border-accent/40 bg-accent/10 text-accent",
  cyan: "border-cyan/40 bg-cyan/10 text-cyan",
  gold: "border-gold/40 bg-gold/10 text-gold",
  danger: "border-danger/40 bg-danger/10 text-danger",
  warning: "border-warning/40 bg-warning/10 text-warning",
  neutral: "border-edge bg-raised text-secondary",
};

export interface NoticeProps {
  /** Teinte sémantique — `danger` reproduit exactement l'`ErrorNote`. */
  tone?: Tone;
  /** Icône Lucide ; `null` pour aucune icône. Défaut : icône du ton. */
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
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${TONE_CLASS[tone]} ${className}`.trim()}
    >
      {resolved ? (
        <span className="mt-px grid shrink-0 place-items-center [&>svg]:size-4">
          {resolved}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        {title ? <span className="font-semibold">{title}</span> : null}
        <span>{children}</span>
      </span>
    </div>
  );
}
