"use client";

import { Trophy } from "lucide-react";

import {
  ROLLOVER_OUTCOME_LABEL,
  ROLLOVER_OUTCOME_TONE,
  divisionDisplayRank,
  seasonResultLabel,
  type DivisionView,
  type RolloverOutcome,
} from "../lib/ranking";
import { DivisionBadge } from "./division-badge";

/** Une saison du palmarès — `GET /rankings/history/:username`. */
export interface SeasonHistoryEntry {
  seasonId: string;
  seasonName: string;
  startsAt: string;
  endsAt: string | null;
  /** `upcoming` | `live` | `ended` | `closed`. */
  state: string;
  game: { slug: string; name: string };
  division: (DivisionView & { id: string }) | null;
  points: number;
  wins: number;
  losses: number;
  duelsPlayed: number;
  /** FIGÉ à la clôture ; nul sur une saison en cours OU sur un joueur non classé. */
  finalPosition: number | null;
  finalOutcome: RolloverOutcome | null;
}

export interface SeasonHistoryProps {
  entries: readonly SeasonHistoryEntry[];
  /** Filtre d'affichage : ne montrer qu'une discipline. */
  gameSlug?: string;
  className?: string;
}

const TONE_CLASS: Record<string, string> = {
  success: "bg-success/12 text-success",
  danger: "bg-danger/12 text-danger",
  neutral: "bg-raised text-secondary",
};

/**
 * Le PALMARÈS d'un joueur — ses saisons passées (document §10 : « il peut
 * consulter son historique : anciennes saisons, promotions, relégations et
 * performances »).
 *
 * Ce que cet écran doit réussir, et qui n'est pas évident : **un joueur relégué
 * doit comprendre pourquoi sans avoir à demander.** D'où, sur chaque ligne, la
 * position finale ET le nombre de duels joués — c'est presque toujours le
 * second qui explique le premier, un joueur sous le plancher étant relégué
 * avant ceux qui ont joué.
 *
 * Rien n'est recalculé ici : `finalPosition` et `finalOutcome` sont figés en
 * base à la clôture. Un palmarès qu'on rejouerait avec les règles du jour
 * changerait de motif tout seul.
 */
export function SeasonHistory({
  entries,
  gameSlug,
  className = "",
}: SeasonHistoryProps) {
  const shown = gameSlug
    ? entries.filter((entry) => entry.game.slug === gameSlug)
    : entries;

  if (shown.length === 0) {
    return (
      <p className={`text-sm text-secondary ${className}`.trim()}>
        Aucune saison jouée pour l’instant. Le premier duel validé ouvre ton
        palmarès.
      </p>
    );
  }

  return (
    <ul className={`flex flex-col divide-y divide-edge ${className}`.trim()}>
      {shown.map((entry) => {
        const tone = entry.finalOutcome
          ? ROLLOVER_OUTCOME_TONE[entry.finalOutcome]
          : null;
        return (
          <li
            key={`${entry.seasonId}-${entry.game.slug}`}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3"
          >
            <div className="flex min-w-40 flex-1 flex-col">
              <span className="text-sm font-semibold">{entry.seasonName}</span>
              <span className="text-xs text-muted">{entry.game.name}</span>
            </div>

            {entry.division ? (
              <DivisionBadge
                rank={divisionDisplayRank(entry.division)}
                name={entry.division.name}
                color={entry.division.color}
              />
            ) : null}

            <span className="inline-flex items-center gap-1.5 text-sm">
              <Trophy aria-hidden className="size-3.5 text-gold" />
              <span className="scoreboard">
                {seasonResultLabel(entry.state, entry.finalPosition)}
              </span>
            </span>

            {/*
              Le nombre de duels est à côté de la position, et pas dans un
              repli : c'est lui qui explique le plus souvent une relégation.
            */}
            <span className="text-xs text-secondary">
              {entry.duelsPlayed} duel{entry.duelsPlayed > 1 ? "s" : ""} ·{" "}
              <span className="scoreboard">{entry.wins}</span>
              <span className="text-muted">/</span>
              <span className="scoreboard">{entry.losses}</span>
            </span>

            <span className="scoreboard text-sm text-accent">
              {entry.points}
              <span className="ml-0.5 text-xs text-muted">pts</span>
            </span>

            {entry.finalOutcome && tone ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASS[tone]}`}
              >
                {ROLLOVER_OUTCOME_LABEL[entry.finalOutcome]}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
