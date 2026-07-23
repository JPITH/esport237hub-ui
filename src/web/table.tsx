"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  align?: "left" | "right" | "center";
  /** Masqué sous md (colonnes secondaires). */
  hideOnMobile?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  className?: string;
}

/** Tableau maison — en-tête collant, lignes cliquables, scroll horizontal. */
export function Table<T>({
  columns,
  rows,
  getKey,
  onRowClick,
  empty,
  className = "",
}: TableProps<T>) {
  const alignClass = (a?: Column<T>["align"]) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-edge bg-surface ${className}`}
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
                {empty ?? "Aucune donnée."}
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
                    {c.render
                      ? c.render(row, i)
                      : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
