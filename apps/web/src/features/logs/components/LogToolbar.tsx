"use client";

import React from "react";
import { Search, History, GitBranch, X, Server } from "lucide-react";
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Checkbox } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS } from "@/lib/logs";
import { LogLevel, ServiceName, ExportFormat, LEVELS, SERVICES, type LogEvent } from "../types";
import { ExportButton } from "./ExportButton";
import { UI_COPY } from "@/lib/ui-copy";

export interface LogToolbarProps {
  query: string;
  setQuery: (q: string) => void;
  regex: boolean;
  setRegex: (r: boolean | ((p: boolean) => boolean)) => void;
  history: string[];
  services: ServiceName[];
  setServices: (s: ServiceName[]) => void;
  levels: LogLevel[];
  setLevels: (l: LogLevel[] | ((p: LogLevel[]) => LogLevel[])) => void;
  traceFilter: string;
  setTraceFilter: (t: string) => void;
  filteredLogs: LogEvent[];
  levelCounts: Record<LogLevel, number>;
  onCommitSearch: () => void;
}

export function LogToolbar({
  query,
  setQuery,
  regex,
  setRegex,
  history,
  services,
  setServices,
  levels,
  setLevels,
  traceFilter,
  setTraceFilter,
  filteredLogs,
  levelCounts,
  onCommitSearch,
}: LogToolbarProps) {
  let regexOk = true;
  if (regex && query) {
    try {
      new RegExp(query);
    } catch {
      regexOk = false;
    }
  }

  return (
    <section className="panel flex flex-wrap items-center gap-2 p-2">
      {/* Search Input with Regex and History */}
      <div className="relative min-w-64 flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCommitSearch()}
          placeholder={regex ? "regex filter, e.g. timeout|OOM" : "Search messages…"}
          className="h-8 pr-40 pl-8 font-mono text-xs"
        />
        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-1">
          {regex && query && (
            <span className={cn("chip", regexOk ? "lvl-info" : "lvl-error")}>
              {regexOk ? "✓ valid" : "✗ invalid"}
            </span>
          )}
          <button
            type="button"
            onClick={() => setRegex((r) => !r)}
            className={cn("chip hover:border-primary cursor-pointer", regex && "lvl-info")}
          >
            .*
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="chip hover:border-primary cursor-pointer">
                <History className="size-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1" align="end">
              <div className="text-muted-foreground px-2 py-1 text-[10px] tracking-wider uppercase">
                Recent searches
              </div>
              {history.length > 0 ? (
                history.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setQuery(h);
                      setRegex(h.includes("|"));
                    }}
                    className="hover:bg-accent block w-full rounded px-2 py-1.5 text-left font-mono text-xs"
                  >
                    {h}
                  </button>
                ))
              ) : (
                <div className="text-muted-foreground p-2 text-center text-xs">
                  No search history
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Service Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 font-mono text-xs">
            <Server className="mr-1 size-3.5" />
            {services.length ? `${services.length} services` : "All services"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-1">
          {SERVICES.map((s) => (
            <label
              key={s}
              className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 font-mono text-xs"
            >
              <Checkbox
                checked={services.includes(s)}
                onCheckedChange={(c) =>
                  setServices(c ? [...services, s] : services.filter((x) => x !== s))
                }
              />
              {s}
            </label>
          ))}
          {services.length > 0 && (
            <button
              type="button"
              onClick={() => setServices([])}
              className="text-primary w-full px-2 py-1.5 text-left text-xs hover:underline"
            >
              Clear filter
            </button>
          )}
        </PopoverContent>
      </Popover>

      {/* Severity Badges */}
      <div className="flex items-center gap-1">
        {LEVELS.map((lv) => {
          const on = levels.includes(lv);
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setLevels((p) => (on ? p.filter((x) => x !== lv) : [...p, lv]))}
              className={cn(
                "chip cursor-pointer transition-all",
                on || !levels.length ? LEVEL_CLASS[lv] : "opacity-40",
                on && "ring-1 ring-current",
              )}
            >
              {lv}
              <span className="opacity-70">{levelCounts[lv]}</span>
            </button>
          );
        })}
      </div>

      {/* Trace ID Filter */}
      <div className="relative">
        <GitBranch className="text-muted-foreground absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
        <Input
          value={traceFilter}
          onChange={(e) => setTraceFilter(e.target.value)}
          placeholder={UI_COPY.LOGS.FILTERS.TRACE_ID_PLACEHOLDER}
          className="h-8 w-36 pl-7 font-mono text-xs"
        />
        {traceFilter && (
          <button
            type="button"
            onClick={() => setTraceFilter("")}
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X className="text-muted-foreground hover:text-foreground size-3" />
          </button>
        )}
      </div>

      <ExportButton format={ExportFormat.PARQUET} rows={filteredLogs} />
      <ExportButton format={ExportFormat.JSONL} rows={filteredLogs} />
    </section>
  );
}
