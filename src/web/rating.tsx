"use client";

import type { CSSProperties, ReactNode } from "react";
import { Lock, Star } from "lucide-react";

import { useDsT } from "../i18n";
import {
  RATING_AXES,
  RATING_GATE_MESSAGE,
  RATING_LABELS,
  RATING_MAX,
  formatRatingAverage,
  ratingCountLabel,
  ratingDistribution,
  starFills,
  type RatingAxis,
  type RatingGate,
  type RatingScore,
} from "../lib/rating";

/* ------------------------------------------------------------------ */
/* StarRating — lecture                                                */
/* ------------------------------------------------------------------ */

export interface StarRatingProps {
  /** Note affichée, décimales comprises (4,3 → quatre pleines + 30 %). */
  value: number | null | undefined;
  /** Côté d'une étoile en pixels (défaut 16). */
  size?: number;
  /** Écrit la valeur à droite des étoiles. */
  showValue?: boolean;
  className?: string;
}

/**
 * Les étoiles d'une note, en LECTURE.
 *
 * Les étoiles sont OR (`gold`), jamais accent : DESIGN.md interdit à l'accent
 * de dire un état, et une note EST un état. L'or est justement le jeton
 * « podium, décoratif » du système.
 *
 * Le remplissage partiel se fait par recouvrement : une rangée vide, une
 * rangée pleine par-dessus, coupée à la largeur voulue. Pas de demi-étoile
 * dessinée à la main — 4,1 et 4,9 doivent se distinguer.
 */
export function StarRating({
  value,
  size = 16,
  showValue = false,
  className = "",
}: StarRatingProps) {
  const t = useDsT();
  const fills = starFills(value);
  const filled = fills.reduce((sum, f) => sum + f, 0);
  const label =
    value === null || value === undefined
      ? t("rating.summary.not_rated")
      : t("rating.summary.value_of_max", { value: formatRatingAverage(value), max: RATING_MAX });

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      <span className="inline-flex" aria-hidden>
        {fills.map((fill, i) => (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              className="absolute inset-0 text-muted"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            {fill > 0 ? (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="text-gold"
                  style={{ width: size, height: size }}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </span>
            ) : null}
          </span>
        ))}
      </span>
      {showValue ? (
        <span className="text-sm font-semibold tabular-nums">
          {formatRatingAverage(filled === 0 ? null : value)}
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* StarRatingInput — saisie                                            */
/* ------------------------------------------------------------------ */

export interface StarRatingInputProps {
  /** Note choisie ; `null` tant que le joueur n'a rien posé. */
  value: RatingScore | null;
  onChange: (value: RatingScore) => void;
  /** Nom du groupe de boutons radio — obligatoire dans un formulaire. */
  name: string;
  /** Intitulé lu par les lecteurs d'écran (« Note de la salle »). */
  legend: string;
  size?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Saisie d'une note — un vrai groupe de boutons radio.
 *
 * Cinq `<input type="radio">` empilés sous les étoiles : la navigation au
 * clavier (flèches), le rattachement au `<form>` et la restitution vocale
 * viennent du navigateur. Une rangée de `<div onClick>` aurait été
 * inutilisable au clavier — et une note est ce qu'on demande à l'utilisateur
 * juste après une séance, souvent sur un poste partagé de la salle.
 */
export function StarRatingInput({
  value,
  onChange,
  name,
  legend,
  size = 32,
  disabled = false,
  className = "",
}: StarRatingInputProps) {
  const t = useDsT();
  const scores: RatingScore[] = [1, 2, 3, 4, 5];

  return (
    <fieldset
      className={`flex flex-col gap-2 ${disabled ? "opacity-60" : ""} ${className}`.trim()}
      disabled={disabled}
    >
      <legend className="sr-only">{legend}</legend>
      <div className="flex items-center gap-1">
        {scores.map((score) => {
          const active = value !== null && score <= value;
          return (
            <label
              key={score}
              className="cursor-pointer p-0.5 transition-transform hover:scale-110"
              title={RATING_LABELS[score]}
            >
              <input
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                className="sr-only peer"
              />
              <Star
                aria-hidden
                style={{ width: size, height: size }}
                strokeWidth={1.5}
                fill={active ? "currentColor" : "none"}
                className={`${active ? "text-gold" : "text-muted"} peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent`}
              />
              <span className="sr-only">
                {score} — {RATING_LABELS[score]}
              </span>
            </label>
          );
        })}
      </div>
      {/* La légende de l'échelle, sinon 3 étoiles ne veulent rien dire. */}
      <span className="text-xs text-secondary" aria-live="polite">
        {value === null ? t("rating.input.choose") : RATING_LABELS[value]}
      </span>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* RatingSummary                                                       */
/* ------------------------------------------------------------------ */

export interface RatingSummaryProps {
  average: number | null | undefined;
  count: number;
  /** Nombre d'avis par note — l'histogramme n'est rendu que s'il est fourni. */
  breakdown?: Partial<Record<RatingScore, number>> | null;
  /** Moyennes par axe (équipement, connexion…), facultatives. */
  axes?: Partial<Record<RatingAxis, number | null>> | null;
  className?: string;
}

/**
 * Le bloc « note de la salle » : moyenne, nombre d'avis, histogramme, axes.
 *
 * Une salle sans avis affiche « Aucun avis » et un appel à en poser un —
 * jamais « 0/5 ». Elle n'a pas démérité, elle vient d'ouvrir (UX.md : ne
 * jamais démarrer un utilisateur à zéro).
 */
export function RatingSummary({
  average,
  count,
  breakdown,
  axes,
  className = "",
}: RatingSummaryProps) {
  const t = useDsT();
  const empty = !count;
  const bars = breakdown ? ratingDistribution(breakdown) : null;

  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="scoreboard text-4xl leading-none text-gold">
            {formatRatingAverage(empty ? null : average)}
          </span>
          <StarRating value={empty ? 0 : average} size={14} className="mt-1" />
          <span className="mt-1 text-xs text-secondary">{ratingCountLabel(count)}</span>
        </div>

        {bars && !empty ? (
          <ul className="flex flex-1 flex-col gap-1">
            {bars.map((bar) => (
              <li key={bar.score} className="flex items-center gap-2 text-xs">
                <span className="w-3 tabular-nums text-secondary">{bar.score}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                  <span
                    className="block h-full rounded-full bg-gold"
                    style={{ width: `${bar.percent}%` }}
                  />
                </span>
                <span className="w-8 text-right tabular-nums text-muted">{bar.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex-1 text-sm text-secondary">{t("rating.summary.empty")}</p>
        )}
      </div>

      {axes && !empty ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {RATING_AXES.map((axis) => {
            const score = axes[axis.key];
            if (score === null || score === undefined) return null;
            return (
              <li key={axis.key} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-secondary">{axis.label}</span>
                <StarRating value={score} size={11} showValue />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VenueReview                                                         */
/* ------------------------------------------------------------------ */

export interface VenueReviewProps {
  author: string;
  /** Déjà mis en forme par l'application (`relative-time`). */
  when: string;
  score: number;
  comment?: string | null;
  /** Repère « a joué ici » — c'est ce qui rend l'avis crédible. */
  verified?: boolean;
  /** Réponse du gérant, quand il y en a une. */
  reply?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Un avis dans la liste d'une salle. */
export function VenueReview({
  author,
  when,
  score,
  comment,
  verified = true,
  reply,
  className = "",
  style,
}: VenueReviewProps) {
  const t = useDsT();
  return (
    <article
      className={`flex flex-col gap-2 border-b border-edge py-3 last:border-b-0 ${className}`.trim()}
      style={style}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold">{author}</span>
        {verified ? (
          <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
            {t("rating.review.played_here")}
          </span>
        ) : null}
        <span className="ml-auto text-xs text-muted">{when}</span>
      </div>
      <StarRating value={score} size={13} />
      {comment ? <p className="text-sm text-secondary">{comment}</p> : null}
      {reply ? (
        <div className="rounded-md border border-edge bg-raised p-2 text-sm text-secondary">
          {reply}
        </div>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* RatingGateNotice                                                    */
/* ------------------------------------------------------------------ */

export interface RatingGateNoticeProps {
  gate: RatingGate;
  className?: string;
}

/**
 * Pourquoi le joueur ne peut pas (encore) noter. Le refus dit la CONDITION,
 * jamais « accès refusé » : sinon l'écran est sans issue.
 */
export function RatingGateNotice({ gate, className = "" }: RatingGateNoticeProps) {
  if (gate === "open") return null;
  return (
    <p
      className={`flex items-start gap-2 rounded-md border border-edge bg-raised p-3 text-sm text-secondary ${className}`.trim()}
    >
      <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
      {RATING_GATE_MESSAGE[gate]}
    </p>
  );
}
