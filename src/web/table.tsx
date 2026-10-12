"use client";

import type { ReactNode } from "react";

import { useDsT } from "../i18n";

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
}: TableProps<T>) {
  const t = useDsT();
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
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-secondary"
              >
                {empty ?? t("form.table.empty")}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={getKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-edge/60 last:border-0 transition-colors ${
                  onRowClick
                    ? "cursor-pointer hover:bg-raised"
                    : ""
                }`}
              >
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
            ))
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
        {rows.length === 0 ? (
          <li className="rounded-xl border border-edge bg-surface px-4 py-8 text-center text-sm text-secondary">
            {empty ?? t("form.table.empty")}
          </li>
        ) : (
          rows.map((row, i) => (
            <li
              key={getKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`flex flex-col gap-2 rounded-xl border border-edge bg-surface p-3 text-sm ${
                onRowClick ? "cursor-pointer hover:bg-raised" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
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
          ))
        )}
      </ul>
    </>
  );
}