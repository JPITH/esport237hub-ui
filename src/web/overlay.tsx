"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { IconButton } from "./button";

function useOverlay(open: boolean, onClose: () => void) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return mounted;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Fenêtre modale (popup) centrée, animée, fermable (Escape / overlay / croix). */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useOverlay(open, onClose);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!mounted || !open) return null;

  const sizeClass =
    size === "sm" ? "ui-modal--sm" : size === "lg" ? "ui-modal--lg" : "ui-modal--md";

  return createPortal(
    <>
      <div className="ui-overlay" onClick={onClose} />
      <div className="ui-modal-root">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={`ui-modal ui-animate-pop ${sizeClass}`}
        >
          {title || onClose ? (
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                {title ? (
                  <h2 className="text-lg font-bold">{title}</h2>
                ) : null}
                {description ? (
                  <p className="text-sm text-secondary">{description}</p>
                ) : null}
              </div>
              <IconButton label="Fermer" onClick={onClose}>
                <X />
              </IconButton>
            </div>
          ) : null}
          <div>{children}</div>
          {footer ? (
            <div className="mt-5 flex justify-end gap-2">{footer}</div>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  );
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}

/** Panneau latéral (drawer) glissant depuis la droite. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = 420,
}: DrawerProps) {
  const mounted = useOverlay(open, onClose);
  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div className="ui-overlay" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        className="ui-drawer ui-animate-drawer"
      >
        <div className="flex items-center justify-between gap-4 border-b border-edge px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <IconButton label="Fermer" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-edge px-5 py-4">
            {footer}
          </div>
        ) : null}
      </aside>
    </>,
    document.body,
  );
}
