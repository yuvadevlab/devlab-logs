"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Database, Play, ArrowUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
} from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import type { LogEvent } from "../types";
import { SQL_TEMPLATES, highlightSql, executeQuery } from "./sql-executor";

export interface SqlWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: LogEvent[];
}

/**
 * DuckDB vectorized in-memory query workbench.
 */
export function SqlWorkbench({ open, onOpenChange, logs }: SqlWorkbenchProps) {
  const [sql, setSql] = useState(SQL_TEMPLATES[0].sql);
  const [rows, setRows] = useState<Record<string, string | number>[] | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const preRef = useRef<HTMLPreElement>(null);

  const run = useCallback(() => {
    setRunning(true);
    const t0 = performance.now();
    setTimeout(() => {
      const r = executeQuery(sql, logs);
      setRows(r);
      setSort(null);
      setMs(Math.max(3, Math.round(performance.now() - t0)));
      setRunning(false);
    }, 50);
  }, [sql, logs]);

  useEffect(() => {
    if (open && !rows) {
      const timer = setTimeout(() => {
        run();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, rows, run]);

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-popover h-[78vh] border-t">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Database className="text-primary size-4" />
            DuckDB SQL workbench
          </SheetTitle>
          <SheetDescription>
            Query the in-memory <code className="chip">logs</code> table (
            {logs.length.toLocaleString()} rows) with vectorized execution.
          </SheetDescription>
        </SheetHeader>
        <div className="grid min-h-0 flex-1 gap-3 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="flex min-h-0 flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {SQL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSql(t.sql)}
                  className={cn(
                    "chip hover:border-primary",
                    sql === t.sql && "border-primary text-primary",
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="panel relative min-h-48 flex-1 overflow-hidden">
              <pre
                ref={preRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-3 font-mono text-xs leading-5 wrap-break-word whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: highlightSql(sql) + "\n" }}
              />
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                spellCheck={false}
                onScroll={(e) => {
                  if (preRef.current) preRef.current.scrollTop = e.currentTarget.scrollTop;
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
                }}
                className="caret-primary absolute inset-0 resize-none bg-transparent p-3 font-mono text-xs leading-5 wrap-break-word whitespace-pre-wrap text-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={run} disabled={running}>
                <Play className="mr-1 size-3.5" />
                {running ? "Running…" : "Run query"}
              </Button>
              <span className="text-muted-foreground font-mono text-[11px]">⌘↵</span>
              {ms !== null && !running && (
                <span className="chip lvl-info ml-auto">
                  Executed in {ms}ms · {rows?.length} rows
                </span>
              )}
            </div>
          </div>
          <div className="panel min-h-0 overflow-auto">
            {sorted && sorted.length ? (
              <table className="w-max min-w-full table-fixed font-mono text-xs">
                <thead className="bg-surface-2 sticky top-0">
                  <tr>
                    {cols.map((c) => (
                      <th
                        key={c}
                        style={{ width: widths[c] ?? (c === "signature" ? 380 : 120) }}
                        className="text-muted-foreground relative border-b px-3 py-2 text-left font-medium"
                      >
                        <button
                          type="button"
                          className="hover:text-foreground flex items-center gap-1"
                          onClick={() =>
                            setSort((s) => ({ k: c, d: s?.k === c && s.d === 1 ? -1 : 1 }))
                          }
                        >
                          {c}
                          <ArrowUpDown className={cn("size-3", sort?.k === c && "text-primary")} />
                        </button>
                        <span
                          onMouseDown={(e) => startResize(c, e)}
                          className="hover:bg-primary/50 absolute inset-y-0 right-0 w-1.5 cursor-col-resize"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr key={i} className="border-border/40 hover:bg-accent/50 border-b">
                      {cols.map((c) => (
                        <td
                          key={c}
                          className={cn(
                            "truncate px-3 py-1.5",
                            typeof r[c] === "number" && "text-syn-num tabular-nums",
                          )}
                        >
                          {String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-muted-foreground grid h-full place-items-center">
                {running ? "Executing…" : "No rows returned."}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
