"use client";

import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";

import { formatXaf } from "../lib/money";
import { TOPUP_PRESETS } from "../lib/wallet";
import { Button } from "./button";
import { Card } from "./foundation";
import { Skeleton } from "./primitives";

/* ------------------------------------------------------------------ */
/* BalanceCard                                                         */
/* ------------------------------------------------------------------ */

export interface BalanceCardProps {
  /** Solde en FCFA ; `null` = encore en chargement (squelette). */
  balanceXaf: number | null;
  /** Intitulé au-dessus du montant (défaut « Solde disponible »). */
  label?: string;
  /** Boutons d'action sous le montant (Recharger, Retirer…). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Carte de solde du portefeuille : intitulé, montant, actions.
 * Le chargement est un squelette, pas un « 0 FCFA » trompeur.
 */
export function BalanceCard({
  balanceXaf,
  label = "Solde disponible",
  actions,
  className = "",
}: BalanceCardProps) {
  return (
    <Card className={`flex flex-col gap-3 ${className}`.trim()}>
      <span className="flex items-center gap-2 text-sm font-medium text-secondary">
        <WalletIcon className="size-[18px]" aria-hidden /> {label}
      </span>
      {balanceXaf === null ? (
        <Skeleton className="h-9 w-40 rounded-md" />
      ) : (
        <span className="text-3xl font-black tabular-nums text-accent">
          {formatXaf(balanceXaf)}
        </span>
      )}
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* TransactionRow                                                      */
/* ------------------------------------------------------------------ */

export interface TransactionRowProps {
  /** `credit` = argent qui entre (vert, flèche entrante). */
  direction: "credit" | "debit";
  /** Motif lisible (`transaction.reason` ou `walletSourceLabel(source)`). */
  label: string;
  /** Date déjà mise en forme par l'appelant (`formatDate`). */
  dateLabel: string;
  amountXaf: number;
  className?: string;
}

/**
 * Ligne de journal financier : pastille teintée, motif + date, montant signé.
 *
 * Le même motif était écrit trois fois (journal du portefeuille web, son
 * jumeau natif, et les mouvements de points de la fiche joueur).
 */
export function TransactionRow({
  direction,
  label,
  dateLabel,
  amountXaf,
  className = "",
}: TransactionRowProps) {
  const credit = direction === "credit";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${className}`.trim()}>
      <span
        aria-hidden
        className={`grid size-9 shrink-0 place-items-center rounded-full ${
          credit ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
        }`}
      >
        {credit ? (
          <ArrowDownLeft className="size-[18px]" />
        ) : (
          <ArrowUpRight className="size-[18px]" />
        )}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{label}</span>
        <span className="text-xs text-muted">{dateLabel}</span>
      </div>
      <span
        className={`ml-auto shrink-0 text-sm font-bold tabular-nums ${
          credit ? "text-success" : "text-danger"
        }`}
      >
        {credit ? "+" : "−"}
        {formatXaf(amountXaf)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AmountPresets                                                       */
/* ------------------------------------------------------------------ */

export interface AmountPresetsProps {
  /** Montants proposés (défaut `TOPUP_PRESETS` : 1000 / 2000 / 5000 / 10000). */
  presets?: readonly number[];
  value: number | null;
  onSelect: (amount: number) => void;
  className?: string;
}

/** Rangée de montants en un clic — recharge du portefeuille. */
export function AmountPresets({
  presets = TOPUP_PRESETS,
  value,
  onSelect,
  className = "",
}: AmountPresetsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {presets.map((preset) => (
        <Button
          key={preset}
          size="sm"
          variant={value === preset ? "primary" : "secondary"}
          aria-pressed={value === preset}
          onClick={() => onSelect(preset)}
        >
          {formatXaf(preset)}
        </Button>
      ))}
    </div>
  );
}
