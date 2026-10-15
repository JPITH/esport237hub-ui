"use client";

/**
 * Confirmer un geste qui ne se rattrape pas (ou mal) — le motif de
 * `cancel-duel-modal` du back-office, devenu une brique (audit web du
 * 15/10/2026, WA7/WA9/WJ6/WP11) :
 *
 * - le TITRE est la question (« Retirer ce visuel ? ») ;
 * - `consequence` dit ce qui se passe ensuite (« Le jeu n'aura plus
 *   d'image dans le catalogue. ») ;
 * - le bouton d'annulation dit ce qu'on GARDE (« Garder le visuel »), jamais
 *   « Annuler » : sur une commande, « Annuler » voulait dire les deux ;
 * - l'erreur s'affiche DANS la fenêtre, au-dessus des boutons : une erreur
 *   posée sur la page, sous la fenêtre, n'était jamais vue ;
 * - pendant l'envoi (`busy`), la fenêtre ne se ferme ni par Échap, ni par le
 *   fond, ni par « Garder… ».
 *
 * Contrôlée : l'écran tient `open`, `busy` et `error` (le texte de
 * `friendlyError`). Le natif a `Dialog` (`../native/dialog.tsx`), dont les
 * actions referment avant d'agir : sur mobile, la confirmation d'un geste
 * réseau passe par une feuille ; d'où un nom différent.
 *
 * @example
 * <ConfirmDialog
 *   open={confirming}
 *   title="Retirer ce visuel ?"
 *   consequence="Le jeu n'aura plus d'image dans le catalogue."
 *   confirmLabel="Retirer le visuel"
 *   cancelLabel="Garder le visuel"
 *   tone="danger"
 *   busy={busy}
 *   error={error}
 *   onConfirm={() => void remove()}
 *   onCancel={() => setConfirming(false)}
 * />
 */
import type { ReactNode } from "react";

import { Button } from "./button";
import { Modal } from "./overlay";
import { ErrorNote } from "./primitives";

export interface ConfirmDialogProps {
  open: boolean;
  /** La question (« Retirer ce visuel ? »). */
  title: string;
  /** Ce qui se passe ensuite, en une ou deux phrases. */
  consequence?: string;
  /** Le geste (« Retirer le visuel ») : un verbe, pas « OK ». */
  confirmLabel: string;
  /** Ce qu'on garde (« Garder le visuel ») : jamais « Annuler ». */
  cancelLabel: string;
  /** `danger` pour détruire, `success` pour valider, `primary` sinon. */
  tone?: "danger" | "success" | "primary";
  /** L'envoi est en cours : bouton en chargement, fenêtre verrouillée. */
  busy?: boolean;
  /** L'échec du geste, affiché dans la fenêtre. */
  error?: string | null;
  /** Le geste est impossible pour l'instant (motif trop court…). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Un champ (motif), un récapitulatif : sous la conséquence. */
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  consequence,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  busy = false,
  error,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const close = () => {
    if (!busy) onCancel();
  };
  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={consequence}
      size="sm"
      footer={
        <>
          <Button variant="ghost" disabled={busy} onClick={close}>
            {cancelLabel}
          </Button>
          <Button variant={tone} loading={busy} disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children || error ? (
        <div className="flex flex-col gap-3">
          {children}
          {error ? <ErrorNote message={error} /> : null}
        </div>
      ) : null}
    </Modal>
  );
}
