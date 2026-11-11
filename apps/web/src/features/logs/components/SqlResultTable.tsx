/**
 * @file apps/web/src/features/logs/components/SqlResultTable.tsx
 * @description Virtualized in-memory tabular results viewer for SqlWorkbench with column resizing.
 * @module @devlab/logs-web/features/logs/components/SqlResultTable
 */

"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SqlResultTableProps {
  rows: Record<string, string | number>[] | null;
  running: boolean;
}

export function SqlResultTable({ rows, running }: SqlResultTableProps): React.JSX.Element {
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});

  const cols = rows?.[0] ? Object.keys(rows[0]) : [];
  const sorted = useMemo(() => {
    if (!rows || !sort) return rows;
    return [...rows].sort(
      (a, b) => (a[sort.k] > b[sort.k] ? 1 : a[sort.k] < b[sort.k] ? -1 : 0) * sort.d,
    );
  }, [rows, sort]);

  const startResize = (k: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const w0 = widths[k] ?? 140;
    const move = (ev: MouseEvent) =>
      setWidths((w) => ({ ...w, [k]: Math.max(60, w0 + ev.clientX - x0) }));
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="panel dl-sql__table-pane">
      {sorted && sorted.length ? (
        <table className="dl-sql__table">
          <thead style={{ position: "sticky", top: 0, backgroundColor: "var(--surface-2)" }}>
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  style={{ width: widths[c] ?? (c === "signature" ? 380 : 120) }}
                  className="dl-sql__th"
                >
                  <button
                    type="button"
                    className="hover:text-foreground"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "inherit",
                      font: "inherit",
                    }}
                    onClick={() => setSort((s) => ({ k: c, d: s?.k === c && s.d === 1 ? -1 : 1 }))}
                  >
                    {c}
                    <ArrowUpDown
                      className="dl-sql__sort-icon"
                      style={sort?.k === c ? { color: "var(--primary)" } : undefined}
                    />
                  </button>
                  <span onMouseDown={(e) => startResize(c, e)} className="dl-sql__resize-handle" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={i}
                className="dl-sql__table-row"
                style={{
                  borderBottom: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
                  transition: "background-color 150ms ease",
                }}
              >
                {cols.map((c) => (
                  <td
                    key={c}
                    className={cn("dl-sql__td", typeof r[c] === "number" && "text-syn-num")}
                    style={
                      typeof r[c] === "number" ? { fontVariantNumeric: "tabular-nums" } : undefined
                    }
                  >
                    {String(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          style={{
            display: "grid",
            height: "100%",
            placeItems: "center",
            color: "var(--mutedForeground)",
          }}
        >
          {running ? "Executing…" : "No rows returned."}
        </div>
      )}
    </div>
  );
}
