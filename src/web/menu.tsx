/**
 * Menu déroulant générique (web).
 * Les liens restent à la charge de l'app (next/link) via la prop `as`.
 */
'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from 'react';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface DropdownMenuProps {
  /** Contenu du bouton déclencheur (le bouton est fourni par le composant). */
  trigger: ReactNode;
  children: ReactNode;
  /** Alignement du panneau sur le déclencheur. */
  align?: 'start' | 'end';
  /** Libellé accessible du déclencheur. */
  label?: string;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  /** Notifié à chaque ouverture/fermeture (chargement paresseux du contenu…). */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Déclencheur + panneau flottant. Se ferme sur Échap, clic extérieur et clic
 * sur un élément du panneau (délégation : couvre boutons comme liens).
 */
export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  label,
  className,
  triggerClassName,
  panelClassName,
  onOpenChange,
}: DropdownMenuProps) {
  const [open, setOpenState] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  function setOpen(next: boolean) {
    setOpenState(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    function close() {
      setOpenState(false);
      onOpenChange?.(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onOpenChange stable côté appelant
  }, [open]);

  return (
    <div ref={rootRef} className={cx('e237-menu', className)}>
      <button
        type="button"
        className={cx('e237-menu__trigger', triggerClassName)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={panelId}
          role="menu"
          className={cx(
            'e237-menu__panel',
            align === 'start' && 'e237-menu__panel--start',
            'ui-animate-pop',
            panelClassName,
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export type MenuItemProps<T extends ElementType> = {
  as?: T;
  icon?: ReactNode;
  /** Valeur alignée à droite (solde, compteur…). */
  trailing?: ReactNode;
  tone?: 'default' | 'danger';
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'> & { children?: ReactNode };

/** Ligne de menu : bouton par défaut, ou tout composant via `as` (ex. Link). */
export function MenuItem<T extends ElementType = 'button'>({
  as,
  icon,
  trailing,
  tone = 'default',
  className,
  children,
  ...rest
}: MenuItemProps<T>) {
  const Comp = (as ?? 'button') as ElementType;
  const extra = Comp === 'button' ? { type: 'button' as const } : {};
  return (
    <Comp
      role="menuitem"
      className={cx(
        'e237-menu__item',
        tone === 'danger' && 'e237-menu__item--danger',
        className as string | undefined,
      )}
      {...extra}
      {...rest}
    >
      {icon ? (
        <span className="e237-menu__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="e237-menu__label">{children}</span>
      {trailing ? <span className="e237-menu__trailing">{trailing}</span> : null}
    </Comp>
  );
}

/** Bloc d'en-tête du menu (identité, solde…). */
export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className="e237-menu__head">{children}</div>;
}

export function MenuSeparator() {
  return <div className="e237-menu__sep" role="separator" />;
}
