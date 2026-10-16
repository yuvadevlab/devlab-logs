"use client";

import React from "react";
import { Copy, GitBranch, Activity, Eye, ChevronRight } from "lucide-react";
import { toast } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS, fmtIso, fmtRel } from "@/lib/logs";
import { LogLevel, type LogEvent } from "../types";
import { JsonTree } from "./JsonTree";

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
 * High-density log row rendering severity chips, trace correlation buttons, and syntax tokens.
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
}: LogRowProps) {
  const emph = log.level === LogLevel.ERROR || log.level === LogLevel.FATAL;

  const copyText = (t: string, label: string) => {
    navigator.clipboard?.writeText(t).catch(() => {});
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div
      className={cn("group border-border/40 border-b", isNew && "row-new", emph && "bg-error/5")}
    >
      <div
        onClick={onInspect}
        className="hover:bg-accent/50 relative grid cursor-pointer grid-cols-[150px_64px_130px_120px_1fr_24px] items-center gap-3 px-3 py-1"
      >
        <span className="text-muted-foreground truncate tabular-nums">
          {iso ? fmtIso(log.ts) : fmtRel(log.ts, now)}
        </span>
        <span className={cn("chip justify-center", LEVEL_CLASS[log.level])}>{log.level}</span>
        <span className="chip truncate">{log.service}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTrace();
          }}
          className="chip text-ai hover:border-ai truncate"
          title="Filter by trace"
        >
          <GitBranch className="size-3 shrink-0" />
          {log.traceId ? log.traceId.slice(0, 10) : "no-trace"}
        </button>
        <span className="truncate">{highlight(log.message, query, regex)}</span>
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
        <div className="bg-popover absolute top-1/2 right-10 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border p-0.5 shadow-lg group-hover:flex">
          <ActionButton
            icon={Copy}
            title="Copy message"
            onClick={() => copyText(log.message, "Message")}
          />
          <ActionButton
            icon={GitBranch}
            title="Copy trace ID"
            onClick={() => copyText(log.traceId, "Trace ID")}
          />
          <ActionButton icon={Activity} title="View trace spans" onClick={onInspect} />
          <ActionButton icon={Eye} title="Inspect full payload" onClick={onToggle} />
        </div>
      </div>
      {open && (
        <div className="bg-background/60 px-6 py-2">
          <JsonTree data={log.meta} />
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Copy;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1"
    >
      <Icon className="size-3.5" />
    </button>
  );
}
