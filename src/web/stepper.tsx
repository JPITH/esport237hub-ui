"use client";

import { Check } from "lucide-react";

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Index de l'étape courante (0-based). */
  currentStep: number;
  className?: string;
}

/**
 * Indicateur d'étapes pour formulaires multi-volets (web).
 */
export function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  return (
    <nav
      aria-label="Étapes"
      className={`flex items-center gap-2 ${className}`.trim()}
    >
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        const upcoming = index > currentStep;

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                aria-current={active ? "step" : undefined}
                className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition ${
                  done
                    ? "border-accent bg-accent text-on-accent"
                    : active
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-edge bg-raised/60 text-muted"
                }`}
              >
                {done ? <Check className="size-4" aria-hidden /> : index + 1}
              </span>
              <span
                className={`max-w-[5.5rem] truncate text-center text-[11px] leading-tight ${
                  active
                    ? "font-medium text-primary"
                    : upcoming
                      ? "text-muted"
                      : "text-secondary"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                aria-hidden
                className={`mb-5 h-0.5 flex-1 rounded-full ${
                  done ? "bg-accent" : "bg-edge"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
