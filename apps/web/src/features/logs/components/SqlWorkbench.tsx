"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Database, Play } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Badge,
} from "@devlab-logs/ui";
import type { LogEvent } from "../types";
import { SQL_TEMPLATES, highlightSql, executeQuery } from "./sql-executor";
import { SqlResultTable } from "./SqlResultTable";
import { UI_COPY } from "@/lib/ui-copy";

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
  const preRef = useRef<HTMLPreElement>(null);

  const run = useCallback(() => {
    setRunning(true);
    const t0 = performance.now();
    setTimeout(() => {
      const r = executeQuery(sql, logs);
      setRows(r);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="dl-sql__sheet-content" style={{ height: "78vh" }}>
        <SheetHeader style={{ textAlign: "left" }}>
          <SheetTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database className="dl-sql__db-icon" style={{ color: "var(--primary)" }} />
            {UI_COPY.LOGS.SQL.TITLE}
          </SheetTitle>
          <SheetDescription>
            {UI_COPY.LOGS.SQL.DESCRIPTION_PREFIX}{" "}
            <Badge variant="outline" className="dl-sql__badge">
              logs
            </Badge>{" "}
            {UI_COPY.LOGS.SQL.DESCRIPTION_SUFFIX} ({logs.length.toLocaleString()} rows) with
            vectorized execution.
          </SheetDescription>
        </SheetHeader>
        <div className="dl-sql__layout">
          <div className="dl-sql__editor-pane">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {SQL_TEMPLATES.map((t) => (
                <Button
                  key={t.id}
                  size="sm"
                  variant={sql === t.sql ? "secondary" : "outline"}
                  onClick={() => setSql(t.sql)}
                  className="dl-sql__editor-input"
                  style={{ height: "1.5rem", padding: "0 0.5rem" }}
                >
                  {t.name}
                </Button>
              ))}
            </div>
            <div className="panel dl-sql__editor-box">
              <pre
                ref={preRef}
                aria-hidden
                className="dl-sql__editor-pre"
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
                className="dl-sql__editor-textarea"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Button onClick={run} disabled={running}>
                <Play className="dl-sql__run-icon" />
                {running ? "Running…" : "Run query"}
              </Button>
              <kbd
                style={{
                  borderRadius: "0.25rem",
                  border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
                  backgroundColor: "var(--muted)",
                  color: "var(--mutedForeground)",
                  padding: "0.125rem 0.375rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                }}
              >
                ⌘↵
              </kbd>
              {ms !== null && !running && (
                <Badge
                  variant="outline"
                  className="dl-sql__badge"
                  style={{
                    marginLeft: "auto",
                    borderColor: "color-mix(in oklab, var(--primary) 40%, transparent)",
                    backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  Executed in {ms}ms · {rows?.length} rows
                </Badge>
              )}
            </div>
          </div>
          <SqlResultTable rows={rows} running={running} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
