/**
 * Recherche globale centrée (command palette).
 * L’app fournit l’index ; le filtrage et le clavier sont ici.
 */
'use client';

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { SearchField } from './fields';

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  /** Libellé de groupe (Jeux, Joueurs, Duels…). */
  group: string;
  icon?: ReactNode;
  imageUrl?: string;
  href?: string;
  onSelect?: () => void;
}

export interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  items: GlobalSearchItem[];
  placeholder?: string;
  emptyLabel?: string;
  /** Raccourci affiché en bas (ex. ⌘K). */
  shortcutHint?: string;
}

function filterItems(items: GlobalSearchItem[], query: string): GlobalSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const hay = `${item.title} ${item.subtitle ?? ''} ${item.group}`.toLowerCase();
    return hay.includes(q);
  });
}

function groupItems(items: GlobalSearchItem[]): Array<[string, GlobalSearchItem[]]> {
  const map = new Map<string, GlobalSearchItem[]>();
  for (const item of items) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return Array.from(map.entries());
}

/** Popup central pour chercher dans tout le périmètre utilisateur. */
export function GlobalSearch({
  open,
  onClose,
  items,
  placeholder = 'Rechercher joueurs, duels, jeux, salles…',
  emptyLabel = 'Aucun résultat.',
  shortcutHint = 'Échap pour fermer',
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => {
      const input = inputWrapRef.current?.querySelector('input');
      input?.focus();
    }, 20);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  const filtered = useMemo(() => filterItems(items, query), [items, query]);
  const groups = useMemo(() => groupItems(filtered), [filtered]);
  const flat = filtered;

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        const item = flat[active];
        if (!item) return;
        e.preventDefault();
        if (item.onSelect) item.onSelect();
        else if (item.href) window.location.assign(item.href);
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, flat, active]);

  if (!mounted || !open) return null;

  let flatIndex = -1;

  return createPortal(
    <>
      <div className="ui-overlay" onClick={onClose} />
      <div className="e237-global-search-root">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recherche"
          className="e237-global-search ui-animate-pop"
        >
          <div ref={inputWrapRef} className="e237-global-search__field">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder={placeholder}
            />
          </div>

          <div
            id={listId}
            className="e237-global-search__list"
            role="listbox"
            aria-label="Résultats"
          >
            {flat.length === 0 ? (
              <p className="e237-global-search__empty">{emptyLabel}</p>
            ) : (
              groups.map(([group, groupItems]) => (
                <div key={group} className="e237-global-search__group">
                  <p className="e237-global-search__group-label">{group}</p>
                  {groupItems.map((item) => {
                    flatIndex += 1;
                    const index = flatIndex;
                    const isActive = index === active;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={cx(
                          'e237-global-search__item',
                          isActive && 'e237-global-search__item--active',
                        )}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => {
                          if (item.onSelect) item.onSelect();
                          else if (item.href) window.location.assign(item.href);
                          onClose();
                        }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="e237-global-search__thumb"
                          />
                        ) : item.icon ? (
                          <span className="e237-global-search__icon" aria-hidden>
                            {item.icon}
                          </span>
                        ) : (
                          <span className="e237-global-search__icon" aria-hidden />
                        )}
                        <span className="e237-global-search__text">
                          <span className="e237-global-search__title">{item.title}</span>
                          {item.subtitle ? (
                            <span className="e237-global-search__sub">{item.subtitle}</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="e237-global-search__footer">
            <span>↑↓ naviguer</span>
            <span>↵ ouvrir</span>
            <span>{shortcutHint}</span>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
