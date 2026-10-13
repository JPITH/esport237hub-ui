"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useDsT } from "../i18n";
import { Icon } from "../icons/generated/web";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  align?: "left" | "right" | "center";
  /** Masqué sous md (colonnes secondaires). */
  hideOnMobile?: boolean;
  width?: string;
  /**
   * Place de la colonne dans la CARTE (`mobileCards`, sous 640 px) :
   * `title` en tête à gauche, `aside` à droite du titre (la valeur qui
   * compte : un écart, un statut, l'action), `hide` absente ; sans valeur,
   * une ligne « libellé : valeur » sous le titre.
   */
  card?: "title" | "aside" | "hide";
}

/**
 * Colonne de SÉLECTION (actions groupées, 13/10/2026) : une case en tête de
 * chaque ligne (et de chaque carte sous 640 px), « Tout sélectionner » dans
 * l'en-tête (état partiel compris). L'état vit chez l'appelant — le hook
 * `useSelection` de l'app (`apps/web/src/components/bulk`) rend exactement
 * cet objet :
 *
 * ```tsx
 * const selection = useSelection(rows.map((r) => r.id), { resetKey: filter });
 * <Table rows={rows} getKey={(r) => r.id} selection={selection.table} … />
 * ```
 *
 * La case s'arrête au clic (la ligne cliquable n'ouvre pas son détail) et
 * transmet `shiftKey` : Maj+clic coche une plage. Cible de 44 px.
 */
export interface TableSelection {
  isSelected: (key: string) => boolean;
  /** `shiftKey` : Maj+clic, une plage depuis la dernière case touchée. */
  onToggle: (key: string, event: { shiftKey: boolean }) => void;
  /** Toutes les lignes affichées sont cochées. */
  allSelected: boolean;
  /** Au moins une ligne cochée (case d'en-tête « partielle » si pas toutes). */
  someSelected: boolean;
  onToggleAll: () => void;
  /** Nom lu par un lecteur d'écran : « Sélectionner {label} ». */
  rowLabel?: (key: string) => string;
  /** Ligne non sélectionnable (rien à faire dessus) : case désactivée. */
  isDisabled?: (key: string) => boolean;
}

/**
 * La case de sélection : 44 px de cible, 18 px de case, état partiel.
 * Exportée pour les listes de gestion qui ne sont pas des tableaux (grille de
 * vignettes, cartes) : même case, même Maj+clic (`shiftKey`), même 44 px.
 */
export function SelectionBox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onToggle,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onToggle: (event: { shiftKey: boolean }) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  const on = checked || indeterminate;
  return (
    <label
      className={`relative -m-3 inline-grid size-11 shrink-0 select-none place-items-center ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={ref}
        type="checkbox"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={() => undefined}
        onClick={(e) => {
          e.stopPropagation();
          onToggle({ shiftKey: e.shiftKey });
        }}
        className="peer absolute inset-0 size-full cursor-[inherit] opacity-0"
      />
      <span
        aria-hidden
        className={`grid size-[18px] place-items-center rounded-[5px] border transition-colors peer-focus-visible:shadow-[var(--e237-ring)] ${
          on ? "border-accent bg-accent text-on-accent" : "border-edge bg-surface text-transparent"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {indeterminate && !checked ? (
          <span className="h-0.5 w-2.5 rounded-full bg-current" />
        ) : (
          <Icon name="check" size={12} strokeWidth={3} />
        )}
      </span>
    </label>
  );
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  className?: string;
  /**
   * Sous 640 px, une CARTE par ligne au lieu du tableau (qui coupait sa
   * dernière colonne au bord de l'écran) : voir `Column.card`.
   */
  mobileCards?: boolean;
  /** Colonne de sélection (actions groupées) : voir `TableSelection`. */
  selection?: TableSelection;
}

/** Tableau maison — en-tête collant, lignes cliquables, scroll horizontal. */
export function Table<T>({
  columns,
  rows,
  getKey,
  onRowClick,
  empty,
  className = "",
  mobileCards = false,
  selection,
}: TableProps<T>) {
  const t = useDsT();
  const span = columns.length + (selection ? 1 : 0);
  const rowBox = (key: string) =>
    selection ? (
      <SelectionBox
        checked={selection.isSelected(key)}
        disabled={selection.isDisabled?.(key) ?? false}
        label={t("form.table.selectRow", { label: selection.rowLabel?.(key) ?? key })}
        onToggle={(event) => selection.onToggle(key, event)}
      />
    ) : null;
  const allBox = selection ? (
    <SelectionBox
      checked={selection.allSelected}
      indeterminate={selection.someSelected}
      disabled={rows.length === 0}
      label={t("form.table.selectAll")}
      onToggle={() => selection.onToggleAll()}
    />
  ) : null;
  const alignClass = (a?: Column<T>["align"]) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  const cell = (c: Column<T>, row: T, i: number): ReactNode =>
    c.render ? c.render(row, i) : ((row as Record<string, unknown>)[c.key] as ReactNode);

  const table = (
    <div
      className={`overflow-x-auto rounded-xl border border-edge bg-surface ${
        mobileCards ? "max-sm:hidden" : ""
      } ${className}`}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-edge">
            {selection ? <th className="w-12 py-3 pl-4 pr-0 text-left">{allBox}</th> : null}
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted ${alignClass(
                  c.align,
                )} ${c.hideOnMobile ? "hidden md:table-cell" : ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={span}
                className="px-4 py-10 text-center text-sm text-secondary"
              >
                {empty ?? t("form.table.empty")}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const key = getKey(row, i);
              const picked = selection?.isSelected(key) ?? false;
              return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                aria-selected={selection ? picked : undefined}
                className={`border-b border-edge/60 last:border-0 transition-colors ${
                  picked ? "bg-accent-subtle" : ""
                } ${
                  onRowClick
                    ? "cursor-pointer hover:bg-raised"
                    : ""
                }`}
              >
                {selection ? <td className="w-12 py-3 pl-4 pr-0">{rowBox(key)}</td> : null}
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 ${alignClass(c.align)} ${
                      c.hideOnMobile ? "hidden md:table-cell" : ""
                    }`}
                  >
                    {cell(c, row, i)}
                  </td>
                ))}
              </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  if (!mobileCards) return table;

  const titleCol = columns.find((c) => c.card === "title") ?? columns[0];
  const asideCol = columns.find((c) => c.card === "aside");
  const lines = columns.filter((c) => c !== titleCol && c !== asideCol && c.card !== "hide");
  return (
    <>
      {table}
      <ul className={`flex flex-col gap-2 sm:hidden ${className}`}>
        {selection && rows.length > 0 ? (
          // Tout le libellé coche (contre-visite du 13/10/2026) : la case arrête
          // son propre clic, le texte le relaie — pas de double bascule.
          <li
            className="flex min-h-11 w-fit cursor-pointer select-none items-center gap-3 px-3 text-sm text-secondary"
            onClick={() => selection.onToggleAll()}
          >
            {allBox}
            <span aria-hidden>{t("form.table.selectAll")}</span>
          </li>
        ) : null}
        {rows.length === 0 ? (
          <li className="rounded-xl border border-edge bg-surface px-4 py-8 text-center text-sm text-secondary">
            {empty ?? t("form.table.empty")}
          </li>
        ) : (
          rows.map((row, i) => {
            const key = getKey(row, i);
            const picked = selection?.isSelected(key) ?? false;
            return (
            <li
              key={key}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              aria-selected={selection ? picked : undefined}
              className={`flex flex-col gap-2 rounded-xl border p-3 text-sm ${
                picked ? "border-accent bg-accent-subtle" : "border-edge bg-surface"
              } ${onRowClick ? "cursor-pointer hover:bg-raised" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                {selection ? <div className="shrink-0 pl-1 pt-0.5">{rowBox(key)}</div> : null}
                <div className="min-w-0 flex-1 font-semibold">{cell(titleCol, row, i)}</div>
                {asideCol ? <div className="shrink-0 text-right">{cell(asideCol, row, i)}</div> : null}
              </div>
              {lines.length > 0 ? (
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
                  {lines.map((c) => (
                    <div key={c.key} className="contents">
                      <dt className="text-xs text-muted">{c.header}</dt>
                      <dd className="min-w-0 text-right">{cell(c, row, i)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
            );
          })
        )}
      </ul>
    </>
  );
}