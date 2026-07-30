"use client";

import type { ReactNode } from "react";
import { Banknote } from "lucide-react";

import { formatXaf } from "../lib/money";
import { Button } from "./button";
import { Card } from "./foundation";
import { Notice } from "./notice";

/* ------------------------------------------------------------------ */
/* LabelValueRow                                                       */
/* ------------------------------------------------------------------ */

export interface LabelValueRowProps {
  label: ReactNode;
  value: ReactNode;
  /** Met la valeur en avant (or) — « À reverser », montants à payer. */
  strong?: boolean;
  className?: string;
}

/**
 * Ligne « libellé à gauche / valeur à droite ».
 *
 * Motif omniprésent (récapitulatif de réservation d'un duel, fiche salle,
 * bloc d'encaissement) réécrit à chaque fois avec un `justify-between`
 * différent.
 */
export function LabelValueRow({
  label,
  value,
  strong = false,
  className = "",
}: LabelValueRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-2 ${className}`.trim()}
    >
      <span className="text-sm text-secondary">{label}</span>
      <span
        className={
          strong
            ? "text-base font-extrabold tabular-nums text-gold"
            : "text-base font-bold tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PayoutCard                                                          */
/* ------------------------------------------------------------------ */

export interface PayoutCardProps {
  /** Recette nette accumulée. */
  netXaf: number;
  /** Montant encore à reverser ; `0` → « À jour ». */
  payableXaf: number;
  /** Encaissement en cours (POST côté application). */
  busy?: boolean;
  /** Message d'échec de l'encaissement. */
  error?: string | null;
  onPayout: () => void;
  netLabel?: string;
  payableLabel?: string;
  className?: string;
}

/**
 * Bloc d'encaissement « Recette / À reverser / Encaisser / À jour ».
 *
 * Écrit deux fois côté web (recette de salle et recette d'évènement) alors
 * que le natif l'avait déjà factorisé. L'appel `POST …/payout` reste dans
 * l'application : le design system ne reçoit que `onPayout`, `busy` et
 * `error`.
 */
export function PayoutCard({
  netXaf,
  payableXaf,
  busy = false,
  error,
  onPayout,
  netLabel = "Recette",
  payableLabel = "À reverser",
  className = "",
}: PayoutCardProps) {
  return (
    <Card className={`flex flex-col gap-3 ${className}`.trim()}>
      <LabelValueRow label={netLabel} value={formatXaf(netXaf)} />
      {payableXaf > 0 ? (
        <>
          <LabelValueRow label={payableLabel} value={formatXaf(payableXaf)} strong />
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <Button
            loading={busy}
            icon={<Banknote />}
            className="w-fit"
            onClick={onPayout}
          >
            {busy ? "Encaissement…" : `Encaisser ${formatXaf(payableXaf)}`}
          </Button>
        </>
      ) : (
        <span className="text-xs text-muted">À jour — rien à reverser.</span>
      )}
    </Card>
  );
}
