"use client";

/**
 * Le bandeau de confirmation du WEB — jumeau de `../native/toast.tsx`, même
 * API (`showToast(message, extra?)`, `hideToast()`, `<ToastHost />` monté une
 * fois), même modèle pur (`../lib/toast-model.ts`, `../lib/toast-lifetime.ts`).
 *
 * Audit web du 15/10/2026 (WP8, WJ7, WA6, WA19) : les succès étaient muets
 * (un geste de caisse, une vérification d'identité, un poste changé), ou
 * dits par l'un des deux bandeaux maison (le rail des disciplines, en
 * `aria-hidden` ; « Publié » sur l'accueil), chacun à sa durée. Un seul
 * bandeau maintenant, annoncé aux lecteurs d'écran, avec « Annuler »
 * (10 s) quand le geste se rattrape.
 *
 * @example
 * showToast(t("admin.players.verified", { name }), { undo: () => void unverify(id) });
 * showToast(friendlyError(e, "x.failed"), { failed: true });
 */
import { useSyncExternalStore } from "react";

import { Icon } from "../icons/generated/web";
import { useDsT } from "../i18n/hooks";
import { dsT } from "../i18n/store";
import { toastLifetimeMs } from "../lib/toast-lifetime";
import { buildToast, type ToastExtra, type ToastState } from "../lib/toast-model";
import { Button } from "./button";

export type { ToastAction, ToastExtra, ToastState } from "../lib/toast-model";

let current: ToastState | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Retire le bandeau (sans attendre son échéance). */
export function hideToast(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (current === null) return;
  current = null;
  emit();
}

/**
 * Affiche le bandeau global (monté par `<ToastHost />`). `extra.undo` pose
 * « Annuler » (10 s, le bandeau se ferme PUIS `undo` part) ; `failed` pour
 * un geste qui a échoué ; `pending` pour un geste en cours (« Annulation… »),
 * qui attend la réponse. `haptic` est ignoré sur le web.
 */
export function showToast(message: string, extra?: ToastExtra): void {
  if (timer) clearTimeout(timer);
  timer = null;
  current = buildToast(message, extra, current?.id ?? 0, dsT("ui.toast.undo"), hideToast);
  const lifetime = toastLifetimeMs(current);
  if (lifetime !== null) timer = setTimeout(hideToast, lifetime);
  emit();
}

/** Le bandeau affiché, ou `null` (tests, lecture hors React). */
export function currentToast(): ToastState | null {
  return current;
}

const getCurrent = () => current;
const getServer = () => null;

/** Un bandeau, dessiné ; `null` n'affiche rien. */
export function Toast({ toast }: { toast: ToastState | null }) {
  const t = useDsT();
  // Région vivante TOUJOURS présente : un lecteur d'écran n'annonce que ce
  // qui change DANS une région déjà là.
  return (
    <div
      className="e237-toast-dock"
      role={toast?.failed ? "alert" : "status"}
      aria-live={toast?.failed ? "assertive" : "polite"}
    >
      {toast ? (
        <div
          key={toast.id}
          className={`e237-toast ui-animate-pop${toast.failed ? " e237-toast--failed" : ""}`}
        >
          {toast.pending ? (
            <span className="ui-spinner size-4 text-muted" aria-hidden />
          ) : (
            <span className="e237-toast__icon" aria-hidden>
              <Icon name={toast.failed ? "alert-triangle" : "check-circle"} size={18} />
            </span>
          )}
          <span className="e237-toast__text">{toast.message}</span>
          {toast.action ? (
            <Button variant="ghost" size="sm" onClick={toast.action.onPress}>
              {toast.action.label}
            </Button>
          ) : null}
          <button
            type="button"
            className="e237-toast__close"
            aria-label={t("ui.toast.dismiss")}
            title={t("ui.toast.dismiss")}
            onClick={hideToast}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Le bandeau global : à monter UNE fois, dans le cadre de l'app. */
export function ToastHost() {
  const toast = useSyncExternalStore(subscribe, getCurrent, getServer);
  return <Toast toast={toast} />;
}
