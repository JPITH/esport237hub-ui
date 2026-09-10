"use client";

import { CalendarClock, Info } from "lucide-react";

import { useDsT, type DsKey } from "../i18n";
import {
  RANKING_SCOPE_HINT,
  duelsUntilRankedLabel,
  seasonProgress,
  seasonRemainingLabel,
} from "../lib/ranking";

/** Une saison telle que l'API la rend (`GET /rankings/seasons`). */
export interface SeasonView {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  closedAt: string | null;
  /** `upcoming` | `live` | `ended` | `closed` — calculé par l'API. */
  state: string;
}

export interface SeasonBannerProps {
  season: SeasonView;
  /**
   * Duels comptabilisés par le joueur connecté cette saison. Absent = personne
   * n'est connecté, ou la ligne du joueur n'est pas dans la page affichée : on
   * n'affiche alors aucune échéance plutôt qu'une échéance fausse.
   */
  duelsPlayed?: number | null;
  /** Plancher de duels en vigueur — RÉGLABLE, il vient de `GET /rankings/rules`. */
  minDuels?: number;
  className?: string;
}

const STATE_LABEL_KEY: Record<string, DsKey> = {
  upcoming: "ranking.season_state.upcoming",
  live: "ranking.season_state.live",
  ended: "ranking.season_state.ended",
  closed: "ranking.season_state.closed",
};

/**
 * L'en-tête du classement saisonnier : quelle saison, où elle en est, et ce
 * qu'il reste à faire au joueur pour y figurer.
 *
 * Les trois informations ne sont pas décoratives — c'est le seul endroit du
 * produit qui porte une ÉCHÉANCE. Un joueur qui découvre en fin de mois qu'il
 * n'était pas classé aura joué pour rien ; c'est précisément ce que la ligne
 * « encore N duels » existe pour éviter.
 *
 * La barre n'apparaît que si la saison a une fin : une saison sans échéance ne
 * doit pas afficher une barre vide, qui laisserait croire à une fin imminente.
 */
export function SeasonBanner({
  season,
  duelsPlayed,
  minDuels,
  className = "",
}: SeasonBannerProps) {
  const t = useDsT();
  const progress = seasonProgress(season.startsAt, season.endsAt);
  const remaining =
    season.state === "live" ? seasonRemainingLabel(season.endsAt) : null;
  const todo =
    duelsPlayed === null || duelsPlayed === undefined
      ? null
      : duelsUntilRankedLabel(duelsPlayed, minDuels);
  const stateKey = STATE_LABEL_KEY[season.state];

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-edge bg-surface p-3.5 ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <CalendarClock aria-hidden className="size-4 shrink-0 text-accent" />
        <span className="font-display text-sm font-bold">{season.name}</span>
        <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold text-secondary">
          {stateKey ? t(stateKey) : season.state}
        </span>
        {remaining ? (
          <span className="ml-auto text-xs text-secondary">{remaining}</span>
        ) : null}
      </div>

      {progress !== null ? (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-raised"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label={t("ranking.progress_aria", { name: season.name })}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}

      <p className="text-xs text-secondary">{RANKING_SCOPE_HINT.season}</p>

      {todo ? (
        <p className="flex items-start gap-1.5 rounded-md bg-warning/10 p-2 text-xs text-warning">
          <Info aria-hidden className="mt-px size-3.5 shrink-0" />
          {todo}
        </p>
      ) : null}
    </div>
  );
}
