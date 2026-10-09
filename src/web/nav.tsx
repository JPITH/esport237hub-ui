"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from "react";
import { Icon } from "../icons/generated/web";

export interface TabDef<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /**
   * Onglet de NAVIGATION : l'onglet est un lien vers cette route (rendu par
   * `linkAs`) et l'actif porte `aria-current="page"`. Sans `href`, l'onglet
   * est un bouton (`role="tab"` + `aria-selected`).
   */
  href?: string;
  /**
   * Compteur à côté du libellé (09/10/2026) — « Demandes 3 ». `warning`
   * quand un geste attend l'utilisateur, `info` sinon ; rien à zéro. Parité
   * avec `SegmentedTabs` (natif).
   */
  badge?: { count: number; tone: "warning" | "info" } | null;
}

/** Composant de lien du routeur (ex. `next/link`) — le DS reste agnostique. */
export type TabLinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>;

export interface TabsProps<T extends string> {
  tabs: TabDef<T>[];
  value: T;
  /** Obligatoire pour des onglets-boutons ; facultatif pour des onglets-liens. */
  onChange?: (value: T) => void;
  className?: string;
  /**
   * Occupe toute la largeur disponible, onglets répartis à parts égales —
   * pour une barre de 2-3 onglets en tête de page (Duels, Classement). Par
   * défaut la barre est ajustée à son contenu et défile si elle déborde.
   */
  fill?: boolean;
  /** Nom accessible de la barre (« Sections du panel », « Vue »…). */
  label?: string;
  /**
   * Composant de lien des onglets qui ont un `href` (`next/link` dans le
   * dashboard). Défaut : `<a>`.
   */
  linkAs?: TabLinkComponent;
}

function PlainLink(
  props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string },
) {
  return <a {...props} />;
}

/**
 * Onglets segmentés (pilule) — la pastille active GLISSE d'un onglet à
 * l'autre (simple slide en transition CSS, sans rebond), comme sur mobile.
 *
 * Deux usages, un seul rendu :
 * - onglets d'ÉTAT (`onChange`) : `role="tablist"`, boutons `role="tab"` +
 *   `aria-selected` ;
 * - onglets de ROUTE (chaque onglet porte un `href`) : `<nav>` de liens,
 *   l'actif en `aria-current="page"` — clic molette, préchargement et
 *   historique restent ceux d'un vrai lien.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
  fill = false,
  label,
  linkAs: LinkAs = PlainLink,
}: TabsProps<T>) {
  const listRef = useRef<HTMLElement | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );
  const asLinks = tabs.length > 0 && tabs.every((t) => t.href != null);

  // Position/largeur de la pastille = celles de l'onglet actif (mesurées).
  useLayoutEffect(() => {
    const measure = () => {
      const el = listRef.current?.querySelector<HTMLElement>(
        '[aria-selected="true"], [aria-current="page"]',
      );
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [value, tabs]);

  const classes = `seg ${fill ? "seg--fill" : ""} ${className}`;
  const itemClass = (on: boolean) =>
    `seg__item [&>svg]:size-4 ${on ? "seg__item--on" : ""}`;
  const pillNode = pill ? (
    <span
      aria-hidden
      className="seg__pill"
      style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
    />
  ) : null;

  if (asLinks) {
    return (
      <nav
        ref={(el) => {
          listRef.current = el;
        }}
        className={classes}
        aria-label={label}
      >
        {pillNode}
        {tabs.map((t) => (
          <LinkAs
            key={t.value}
            href={t.href as string}
            aria-current={value === t.value ? "page" : undefined}
            onClick={onChange ? () => onChange(t.value) : undefined}
            className={itemClass(value === t.value)}
          >
            {t.icon}
            {t.label}
            <TabBadge badge={t.badge} />
          </LinkAs>
        ))}
      </nav>
    );
  }

  return (
    <div
      ref={(el) => {
        listRef.current = el;
      }}
      className={classes}
      role="tablist"
      aria-label={label}
    >
      {pillNode}
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange?.(t.value)}
          className={itemClass(value === t.value)}
        >
          {t.icon}
          {t.label}
          <TabBadge badge={t.badge} />
        </button>
      ))}
    </div>
  );
}

/** Le compteur d'un onglet — « 9+ » au-delà de neuf, rien à zéro. */
function TabBadge({ badge }: { badge?: TabDef<string>["badge"] }) {
  if (!badge || badge.count <= 0) return null;
  return (
    <span className={`seg__badge seg__badge--${badge.tone}`}>
      {badge.count > 9 ? "9+" : badge.count}
    </span>
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
        <Icon name="chevron-left" size={18} />
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
                ? "border-accent-border bg-accent-subtle text-accent shadow-[var(--e237-neu-pressed-sm)]"
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
        <Icon name="chevron-right" size={18} />
      </button>
    </nav>
  );
}
