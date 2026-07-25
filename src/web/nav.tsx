"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TabDef<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/**
 * Onglets segmentés (pilule) — la pastille active GLISSE d'un onglet à
 * l'autre (simple slide en transition CSS, sans rebond), comme sur mobile.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: {
  tabs: TabDef<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  // Position/largeur de la pastille = celles de l'onglet actif (mesurées).
  useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelector<HTMLElement>(
        '[aria-selected="true"]',
      );
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [value, tabs]);

  return (
    <div ref={listRef} className={`seg ${className}`} role="tablist">
      {pill ? (
        <span
          aria-hidden
          className="seg__pill"
          style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
        />
      ) : null}
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`seg__item [&>svg]:size-4 ${
            value === t.value ? "seg__item--on" : ""
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Puce de filtre avec compteur/statistique (ex. « Douala 12 »). */
export function FilterChip({
  active,
  onClick,
  count,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip [&>svg]:size-4 ${active ? "chip--on" : ""}`}
    >
      {icon}
      {children}
      {count != null ? <span className="chip__count">{count}</span> : null}
    </button>
  );
}

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="tt">
      {children}
      <span role="tooltip" className="tt__bubble">
        {label}
      </span>
    </span>
  );
}

/** Pagination compacte : Précédent / fenêtre de pages / Suivant. */
export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const pages: (number | "…")[] = [];
  const push = (n: number | "…") => pages.push(n);
  const window = 1;
  for (let p = 1; p <= pageCount; p++) {
    if (
      p === 1 ||
      p === pageCount ||
      (p >= page - window && p <= page + window)
    ) {
      push(p);
    } else if (pages[pages.length - 1] !== "…") {
      push("…");
    }
  }

  const navBtn =
    "grid size-9 place-items-center rounded-full border border-edge bg-surface text-secondary shadow-[var(--e237-neu-raised-sm)] transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:pointer-events-none";

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className={navBtn}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
      >
        <ChevronLeft className="size-[18px]" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page}
            className={`grid size-9 place-items-center rounded-full border text-sm font-medium tabular-nums transition-colors ${
              p === page
                ? "border-accent/45 bg-accent/12 text-accent shadow-[var(--e237-neu-pressed-sm)]"
                : "border-edge bg-surface text-secondary shadow-[var(--e237-neu-raised-sm)] hover:border-accent hover:text-accent"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={navBtn}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Page suivante"
      >
        <ChevronRight className="size-[18px]" />
      </button>
    </nav>
  );
}
