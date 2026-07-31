"use client";

import type { ReactNode } from "react";
import type { DuelStatus } from "@esport237hub/types";

import { Badge, Card } from "./foundation";
import { DuelStatusBadge } from "./primitives";

/* ------------------------------------------------------------------ */
/* DuelRow                                                             */
/* ------------------------------------------------------------------ */

export interface DuelRowProps {
  /** Lien vers le détail ; absent = l'application enveloppe elle-même. */
  href?: string;
  onClick?: () => void;
  /** Pseudo du challenger ; `null` → « ? ». */
  challengerName?: string | null;
  /** Pseudo de l'adversaire ; `null` → « adversaire ouvert ». */
  opponentName?: string | null;
  gameName?: string | null;
  isOnline: boolean;
  /** Date déjà mise en forme (programmée, sinon création). */
  dateLabel: string;
  challengerScore: number | null;
  opponentScore: number | null;
  status: DuelStatus;
  className?: string;
}

/**
 * Ligne de liste d'un duel : adversaires, contexte, score et statut.
 *
 * Le web (page `/duels`) et le natif (`components/duel/duel-row.tsx`)
 * écrivaient le même balisage, aux mêmes chaînes près (« adversaire ouvert »,
 * « En ligne » / « En salle », séparateur `·`). La navigation reste à
 * l'application : `href` ou `onClick`.
 */
export function DuelRow({
  href,
  onClick,
  challengerName,
  opponentName,
  gameName,
  isOnline,
  dateLabel,
  challengerScore,
  opponentScore,
  status,
  className = "",
}: DuelRowProps) {
  const hasScore = challengerScore !== null && opponentScore !== null;
  const body = (
    <Card className="flex items-center justify-between gap-3 py-3 transition-all hover:-translate-y-0.5 hover:border-accent">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          {challengerName ?? "?"} vs {opponentName ?? "adversaire ouvert"}
        </span>
        <span className="text-xs text-muted">
          {gameName ?? "—"} · {isOnline ? "En ligne" : "En salle"} · {dateLabel}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {hasScore ? (
          <span className="scoreboard text-sm">
            {challengerScore}–{opponentScore}
          </span>
        ) : null}
        <DuelStatusBadge status={status} />
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className={`block ${className}`.trim()}>
        {body}
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
        {body}
      </button>
    );
  }
  return <div className={className || undefined}>{body}</div>;
}

/* ------------------------------------------------------------------ */
/* ScoreSide                                                           */
/* ------------------------------------------------------------------ */

export interface ScoreSideProps {
  /** Score ; `null` tant que le résultat n'est pas saisi (« – »). */
  score: number | null;
  /** Pseudo ; `null` → « En attente ». */
  username?: string | null;
  /** Nom civil sous le pseudo (facultatif). */
  name?: string | null;
  winner?: boolean;
  /** Lien vers la fiche publique du joueur. */
  href?: string;
  /** Contenu additionnel sous le nom (avatar, drapeau…). */
  children?: ReactNode;
  className?: string;
}

/**
 * Un côté du tableau de score d'un duel : score, pseudo, nom, badge
 * « Vainqueur ». Le lien vers la fiche joueur passe par `href` — le design
 * system ne connaît pas les routes.
 */
export function ScoreSide({
  score,
  username,
  name,
  winner = false,
  href,
  children,
  className = "",
}: ScoreSideProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`.trim()}>
      <span className="text-3xl font-black tabular-nums">{score ?? "–"}</span>
      {href && username ? (
        <a href={href} className="text-sm font-semibold hover:text-accent">
          {username}
        </a>
      ) : (
        <span className="text-sm font-semibold">{username ?? "En attente"}</span>
      )}
      {name ? <span className="text-xs text-muted">{name}</span> : null}
      {winner ? <Badge tone="gold">Vainqueur</Badge> : null}
      {children}
    </div>
  );
}
