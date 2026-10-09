"use client";

import type { ReactNode } from "react";
import type { DuelSideResult, DuelStatus } from "@esport237hub/types";

import { useDsT } from "../i18n";
import { DUEL_RESULT_META } from "../lib/duel-result";
import { Badge, Card } from "./foundation";
import { DuelStatusBadge } from "./primitives";

/* ------------------------------------------------------------------ */
/* DuelResultPill                                                      */
/* ------------------------------------------------------------------ */

export interface DuelResultPillProps {
  /** L'issue de CE côté du duel (ou de celui qui regarde). */
  result: DuelSideResult;
  /** Score déjà mis en forme (« 3–1 »), dans l'ordre de celui qui lit. */
  score?: string | null;
  size?: "sm" | "md";
  className?: string;
}

/**
 * La pastille de l'issue d'un duel terminé : « Victoire » en vert (`success`),
 * « Défaite » en rouge (`danger`), « Match nul » en `info` — avec le score
 * quand il est connu. Retour du porteur (08/10/2026) : la pastille du gagnant
 * en vert, celle du perdant en rouge, partout où un duel terminé s'affiche.
 * Le mot est toujours là : la couleur n'est jamais le seul signal.
 */
export function DuelResultPill({ result, score, size = "md", className }: DuelResultPillProps) {
  const t = useDsT();
  const meta = DUEL_RESULT_META[result];
  return (
    <Badge tone={meta.tone} size={size} className={className}>
      {t(meta.labelKey)}
      {score ? <span className="tabular-nums">{` · ${score}`}</span> : null}
    </Badge>
  );
}

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
  /**
   * L'issue du point de vue de celui qui regarde (« Mes duels ») et le score
   * dans SON ordre. Présente sur un duel validé, elle remplace le score brut
   * et le statut par la pastille vert / rouge (`DuelResultPill`).
   */
  result?: { outcome: DuelSideResult; score: string } | null;
  /**
   * Remplace la pastille de statut quand son nom dépend de qui regarde : une
   * demande `sent` est « Envoyée » pour son auteur, « Reçue » pour son
   * destinataire (visite du 09/10/2026).
   */
  statusBadge?: ReactNode;
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
  result,
  statusBadge,
  className = "",
}: DuelRowProps) {
  const t = useDsT();
  const hasScore = challengerScore !== null && opponentScore !== null;
  const settled = status === "validated" && result ? result : null;
  const body = (
    <Card className="flex items-center justify-between gap-3 py-3 transition-all hover:-translate-y-0.5 hover:border-accent">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          {challengerName ?? "?"} vs {opponentName ?? t("ui.openOpponent")}
        </span>
        <span className="truncate text-xs text-muted">
          {/* La date en tête : l'ellipse mange la fin, et c'est la date qu'on
              cherche d'abord dans une liste de duels. */}
          {dateLabel} · {gameName ?? "—"} ·{" "}
          {isOnline ? t("ui.online") : t("ui.inVenue")}
        </span>
      </div>
      {/* `min-w-[7rem]` : sans largeur minimale, chaque pastille de statut
          commence où finit son texte et la colonne de droite zigzague. */}
      <div className="flex min-w-[7rem] shrink-0 items-center justify-end gap-3">
        {settled ? (
          <DuelResultPill result={settled.outcome} score={settled.score} />
        ) : (
          <>
            {hasScore ? (
              <span className="scoreboard text-sm">
                {challengerScore}–{opponentScore}
              </span>
            ) : null}
            {statusBadge ?? <DuelStatusBadge status={status} />}
          </>
        )}
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
  /** @deprecated — préférer `result`. Vrai = `result: "win"`. */
  winner?: boolean;
  /**
   * L'issue de ce côté d'un duel terminé : pastille « Victoire » verte,
   * « Défaite » rouge ou « Match nul » (`DuelResultPill`).
   */
  result?: DuelSideResult | null;
  /** Lien vers la fiche publique du joueur. */
  href?: string;
  /** Contenu additionnel sous le nom (avatar, drapeau…). */
  children?: ReactNode;
  className?: string;
}

/**
 * Un côté du tableau de score d'un duel : score, pseudo, nom, et — duel
 * terminé — la pastille de son issue (« Victoire » verte, « Défaite »
 * rouge). Le lien vers la fiche joueur passe par `href` — le design system ne
 * connaît pas les routes.
 */
export function ScoreSide({
  score,
  username,
  name,
  winner = false,
  result,
  href,
  children,
  className = "",
}: ScoreSideProps) {
  const t = useDsT();
  const outcome: DuelSideResult | null = result ?? (winner ? "win" : null);
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`.trim()}>
      <span className="text-3xl font-black tabular-nums">{score ?? "–"}</span>
      {href && username ? (
        <a href={href} className="text-sm font-semibold hover:text-accent">
          {username}
        </a>
      ) : (
        <span className="text-sm font-semibold">{username ?? t("ui.waiting")}</span>
      )}
      {name ? <span className="text-xs text-muted">{name}</span> : null}
      {outcome ? <DuelResultPill result={outcome} /> : null}
      {children}
    </div>
  );
}
