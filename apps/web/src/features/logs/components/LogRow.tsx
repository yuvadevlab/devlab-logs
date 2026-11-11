"use client";

import React from "react";
import { GitBranch, ChevronRight } from "lucide-react";
import { JsonTree, Badge } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS, fmtIso, fmtRel } from "@/lib/logs";
import { UI_COPY } from "@/lib/ui-copy";
import { LogLevel, type LogEvent } from "../types";
import { LogRowQuickActions } from "./LogRowQuickActions";

export interface LogRowProps {
  log: LogEvent;
  now: number;
  iso: boolean;
  isNew: boolean;
  query: string;
  regex: RegExp | null;
  open: boolean;
  onToggle: () => void;
  onTrace: () => void;
  onInspect: () => void;
  isSelected?: boolean;
}

function highlight(text: string, query: string, re: RegExp | null) {
  let rx: RegExp | null = null;
  if (re) rx = new RegExp(re.source, "gi");
  else if (query) rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

  const tokens = text.split(/(\s+)/);
  return tokens.map((tok, i) => {
    let cls = "";
    if (/^\d+(ms|µs|s|%)?[,)]?$/.test(tok) || /^\(\d+ms\)$/.test(tok)) cls = "text-syn-num";
    else if (/^"[^"]*"$/.test(tok) || /^\/[\w/.]+$/.test(tok)) cls = "text-syn-str";
    else if (/^\w+=/.test(tok)) cls = "text-syn-key";

    if (rx && rx.test(tok)) {
      rx.lastIndex = 0;
      const parts = tok.split(new RegExp(`(${rx.source})`, "gi"));
      return (
        <span key={i} className={cls}>
          {parts.map((p, j) => (j % 2 ? <mark key={j}>{p}</mark> : p))}
        </span>
      );
    }
    return cls ? (
      <span key={i} className={cls}>
        {tok}
      </span>
    ) : (
      tok
    );
  });
}

/**
 * Log row rendering severity chips, trace correlation buttons, and syntax tokens.
 */
export function LogRow({
  log,
  now,
  iso,
  isNew,
  query,
  regex,
  open,
  onToggle,
  onTrace,
  onInspect,
  isSelected = false,
}: LogRowProps) {
  const emph = log.level === LogLevel.ERROR || log.level === LogLevel.FATAL;

  return (
    <div
      className={cn(
        "dl-log-row group",
        isNew && "row-new",
        emph && "dl-log-row--emph",
        isSelected && "dl-log-row--selected",
      )}
    >
      <div onClick={onInspect} className="dl-log-row__content">
        <span
          style={{
            color: "var(--mutedForeground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.6875rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {iso ? fmtIso(log.ts) : fmtRel(log.ts, now)}
        </span>
        <Badge
          variant="outline"
          className={cn("justify-center font-mono text-[9px]", LEVEL_CLASS[log.level])}
          style={{ padding: "0 0.25rem" }}
        >
          {log.level}
        </Badge>
        <Badge
          variant="secondary"
          className="dl-log-row__service-badge"
          style={{ padding: "0 0.25rem" }}
        >
          {log.service}
        </Badge>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTrace();
          }}
          className="dl-log-row__trace-badge"
          style={{
            display: "inline-flex",
            cursor: "pointer",
            alignItems: "center",
            gap: "0.25rem",
            borderRadius: "0.25rem",
            border: "1px solid color-mix(in oklab, var(--ai) 40%, transparent)",
            backgroundColor: "color-mix(in oklab, var(--ai) 10%, transparent)",
            color: "var(--ai)",
            padding: "0 0.375rem",
          }}
          title={UI_COPY.LOGS.ROW_ACTIONS.FILTER_BY_TRACE}
        >
          <GitBranch className="dl-log-row__trace-icon" />
          {log.traceId ? log.traceId.slice(0, 10) : UI_COPY.LOGS.STREAM.NO_TRACE}
        </button>
        <span
          style={{
            color: "color-mix(in oklab, var(--foreground) 90%, transparent)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.6875rem",
            lineHeight: "1rem",
          }}
        >
          {highlight(log.message, query, regex)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="hover:text-foreground"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "var(--mutedForeground)",
          }}
        >
          <ChevronRight
            className="dl-log-row__open-icon"
            style={{
              transition: "transform 150ms ease",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Hover Quick Action Buttons */}
        <LogRowQuickActions log={log} onToggle={onToggle} onInspect={onInspect} />
      </div>
      {open && (
        <div
          style={{
            backgroundColor: "color-mix(in oklab, var(--background) 60%, transparent)",
            padding: "0.5rem 1.5rem",
          }}
        >
          <JsonTree data={log.meta} />
        </div>
      )}
    </div>
  );
}
