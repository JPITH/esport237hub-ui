"use client";

import type { ReactNode } from "react";
import { Crown, Loader2, Radio, RefreshCw, WifiOff } from "lucide-react";

import {
  LIVE_STATUS_LABEL,
  divisionMovementLabel,
  formatClock,
  rankMovementLabel,
  rankMovementPlaces,
  type LiveStatus,
  type RankMovement,
} from "../lib/ranking";
import { IconButton } from "./button";
import { DivisionBadge } from "./division-badge";
import { Skeleton, VerifiedMark } from "./primitives";
import { TrendArrow } from "./trend-arrow";

/* ------------------------------------------------------------------ */
/* LiveBar                                                             */
/* ------------------------------------------------------------------ */

export interface LiveBarProps {
  status: LiveStatus;
  refreshing: boolean;
  /** Horodatage de la dernière mise à jour (ms) ; `null` avant montage. */
  updatedAt: number | null;
  onRefresh: () => void;
  className?: string;
}

/**
 * Bandeau d'état du direct.
 *
 * Il dit la vérité : « En direct » uniquement quand le canal est réellement
 * abonné, sinon « Hors direct » avec l'actualisation manuelle à portée de
 * clic. L'écran reste utilisable même WebSocket bloqué.
 *
 * Jumeau natif à props identiques : le web et le mobile affichaient déjà les
 * mêmes libellés, mais pas la même heure (`formatClock` divergeait) — c'est
 * réglé dans `lib/ranking`.
 */
export function LiveBar({
  status,
  refreshing,
  updatedAt,
  onRefresh,
  className = "",
}: LiveBarProps) {
  const live = status === "live";
  const connecting = status === "connecting";
  const Icon = live ? Radio : connecting ? Loader2 : WifiOff;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 ${className}`.trim()}
    >
      <div className="flex items-center gap-2">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            live
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-edge bg-surface text-muted",
          ].join(" ")}
        >
          <Icon
            className={`size-3.5 ${connecting ? "animate-spin" : ""}`}
            aria-hidden
          />
          {LIVE_STATUS_LABEL[status]}
        </span>
        {updatedAt ? (
          <span className="text-xs text-muted">
            Mis à jour à {formatClock(updatedAt)}
          </span>
        ) : null}
      </div>

      <IconButton
        label="Actualiser le classement"
        onClick={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw
          className={`size-4 ${refreshing ? "animate-spin" : ""}`}
          aria-hidden
        />
      </IconButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MovementCell                                                        */
/* ------------------------------------------------------------------ */

export interface MovementCellProps {
  movement: RankMovement;
  rank: number;
  previousRank: number | null;
  /**
   * Clignotement de la ligne qui vient de bouger en direct ; il s'éteint tout
   * seul (le minuteur appartient à l'écran, pas au design system).
   */
  flash?: boolean;
}

/** Flèche de mouvement d'une ligne + nombre de places gagnées ou perdues. */
export function MovementCell({
  movement,
  rank,
  previousRank,
  flash = false,
}: MovementCellProps) {
  const places = rankMovementPlaces(movement, rank, previousRank);
  return (
    <span className={`inline-flex ${flash ? "animate-pulse" : ""}`}>
      <TrendArrow
        movement={movement}
        delta={places}
        label={rankMovementLabel(movement, places)}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* DivisionCell                                                        */
/* ------------------------------------------------------------------ */

export interface DivisionCellProps {
  /** `null` quand le joueur n'est encore classé dans aucune division. */
  division: { rank: number; name: string; color?: string | null } | null;
  /** Mouvement de GRADE (promotion / rétrogradation), pas de rang. */
  movement?: RankMovement;
}

/** Pilule de division + flèche de grade (promotion / rétrogradation). */
export function DivisionCell({ division, movement = "same" }: DivisionCellProps) {
  if (!division) {
    return <span className="text-muted">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <DivisionBadge
        rank={division.rank}
        name={division.name}
        color={division.color}
      />
      {movement === "same" ? null : (
        <TrendArrow
          movement={movement}
          size={12}
          label={divisionMovementLabel(movement, division.name)}
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* RankMedal                                                           */
/* ------------------------------------------------------------------ */

export interface RankMedalProps {
  rank: number;
  className?: string;
}

/** Médaillon de rang : or / argent / bronze au podium, contour sinon. */
export function RankMedal({ rank, className = "" }: RankMedalProps) {
  const cls = rank <= 3 ? `rank-medal--${rank}` : "rank-medal--n";
  return (
    <span className={`rank-medal ${cls} ${className}`.trim()}>{rank}</span>
  );
}

/* ------------------------------------------------------------------ */
/* PlayerCell                                                          */
/* ------------------------------------------------------------------ */

export interface PlayerCellProps {
  username: string;
  city?: string | null;
  verified?: boolean;
}

/** Cellule « joueur » d'un tableau de classement : pseudo + ville. */
export function PlayerCell({ username, city, verified }: PlayerCellProps) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 font-medium">
        {username}
        {verified ? <VerifiedMark /> : null}
      </span>
      <span className="text-xs text-muted">{city ?? "—"}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ChampionSpotlight                                                   */
/* ------------------------------------------------------------------ */

export interface ChampionSpotlightProps {
  /** Précision après « Champion » (nom du jeu, saison…). */
  subtitle?: string;
  /** La carte du champion (`PlayerCard` / `GlobalCard`). */
  children: ReactNode;
  className?: string;
}

/** Mise en avant du premier du classement, encadrée d'or. */
export function ChampionSpotlight({
  subtitle,
  children,
  className = "",
}: ChampionSpotlightProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-5 ${className}`.trim()}
    >
      <div className="flex items-center gap-2 text-gold">
        <Crown className="size-5" aria-hidden />
        <span className="font-display text-sm font-bold uppercase tracking-wider">
          Champion{subtitle ? ` · ${subtitle}` : ""}
        </span>
      </div>
      <div className="w-full max-w-[280px]">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RankingSkeleton                                                     */
/* ------------------------------------------------------------------ */

export interface RankingSkeletonProps {
  /** Nombre de lignes fantômes sous la carte du champion (défaut 5). */
  rows?: number;
  /** Masque la carte du champion (vue globale sans podium). */
  champion?: boolean;
}

/** Squelette de chargement d'un classement (carte du champion + lignes). */
export function RankingSkeleton({
  rows = 5,
  champion = true,
}: RankingSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {champion ? (
        <Skeleton className="mx-auto aspect-[3/4.2] w-[280px] rounded-2xl" />
      ) : null}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
