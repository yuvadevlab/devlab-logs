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
        "group border-border/40 border-b transition-colors",
        isNew && "row-new",
        emph && "bg-error/5",
        isSelected && "bg-accent/60 ring-primary/50 ring-1",
      )}
    >
      <div
        onClick={onInspect}
        className="hover:bg-accent/50 relative grid cursor-pointer grid-cols-[150px_64px_130px_120px_1fr_24px] items-center gap-3 px-3 py-1 font-mono text-xs transition-colors"
      >
        <span className="text-muted-foreground truncate text-[11px] tabular-nums">
          {iso ? fmtIso(log.ts) : fmtRel(log.ts, now)}
        </span>
        <Badge
          variant="outline"
          className={cn("justify-center px-1 py-0 font-mono text-[9px]", LEVEL_CLASS[log.level])}
        >
          {log.level}
        </Badge>
        <Badge variant="secondary" className="truncate px-1 py-0 font-mono text-[9px]">
          {log.service}
        </Badge>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTrace();
          }}
          className="border-ai/40 bg-ai/10 text-ai hover:border-ai inline-flex cursor-pointer items-center gap-1 truncate rounded border px-1.5 py-0 font-mono text-[9px] transition"
          title={UI_COPY.LOGS.ROW_ACTIONS.FILTER_BY_TRACE}
        >
          <GitBranch className="size-2.5 shrink-0" />
          {log.traceId ? log.traceId.slice(0, 10) : UI_COPY.LOGS.STREAM.NO_TRACE}
        </button>
        <span className="text-foreground/90 truncate text-[11px] leading-4">
          {highlight(log.message, query, regex)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
        </button>

        {/* Hover Quick Action Buttons */}
        <LogRowQuickActions log={log} onToggle={onToggle} onInspect={onInspect} />
      </div>
      {open && (
        <div className="bg-background/60 px-6 py-2">
          <JsonTree data={log.meta} />
        </div>
      )}
    </div>
  );
}
