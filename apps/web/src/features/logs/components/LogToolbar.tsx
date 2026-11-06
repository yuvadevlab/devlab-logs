/**
 * @file apps/web/src/features/logs/components/LogToolbar.tsx
 * @description Operational search bar, active filter pills, view controls, and data export.
 * Eliminates redundant facet selectors by deferring field discovery to FacetSidebar.
 * @module @devlab/logs-web/features/logs/components/LogToolbar
 */

"use client";

import React from "react";
import { Search, History, GitBranch, X, BarChart3, AlignJustify, List } from "lucide-react";
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Badge } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LogLevel, ServiceName, ExportFormat, type LogEvent } from "../types";
import { ExportButton } from "./ExportButton";
import { ActiveFilterPills } from "./ActiveFilterPills";
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
  onCommitSearch: () => void;
  showTimeline?: boolean;
  setShowTimeline?: (s: boolean | ((p: boolean) => boolean)) => void;
  density?: "compact" | "comfortable";
  setDensity?: (d: "compact" | "comfortable") => void;
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
  onCommitSearch,
  showTimeline = true,
  setShowTimeline,
  density = "compact",
  setDensity,
}: LogToolbarProps) {
  let regexOk = true;
  if (regex && query) {
    try {
      new RegExp(query);
    } catch {
      regexOk = false;
    }
  }

  const clearAllFilters = () => {
    setServices([]);
    setLevels([]);
    setTraceFilter("");
  };

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
            <Badge
              variant="outline"
              className={cn(
                "px-1 py-0 font-mono text-[9px]",
                regexOk
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                  : "border-destructive text-destructive bg-destructive/10",
              )}
            >
              {regexOk ? "✓ valid" : "✗ invalid"}
            </Badge>
          )}
          <Button
            size="sm"
            variant={regex ? "secondary" : "ghost"}
            onClick={() => setRegex((r) => !r)}
            className="h-6 px-1.5 font-mono text-[11px]"
            title="Toggle regular expressions"
          >
            .*
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 px-1.5" title="Search history">
                <History className="size-3" />
              </Button>
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

      {/* Trace ID Filter Input */}
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
            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
            title="Clear trace filter"
          >
            <X className="text-muted-foreground hover:text-foreground size-3" />
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      <ActiveFilterPills
        levels={levels}
        setLevels={setLevels}
        services={services}
        setServices={setServices}
        onClearAll={clearAllFilters}
      />

      {/* View & Timeline Controls */}
      <div className="ml-auto flex items-center gap-1.5">
        {setShowTimeline && (
          <Button
            size="sm"
            variant={showTimeline ? "secondary" : "outline"}
            onClick={() => setShowTimeline((prev) => !prev)}
            className="h-8 font-mono text-xs"
            title="Toggle Histogram Timeline"
          >
            <BarChart3 className="mr-1 size-3.5" />
            Timeline
          </Button>
        )}

        {setDensity && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDensity(density === "compact" ? "comfortable" : "compact")}
            className="h-8 font-mono text-xs"
            title={`Switch to ${density === "compact" ? "comfortable" : "compact"} density`}
          >
            {density === "compact" ? (
              <AlignJustify className="mr-1 size-3.5" />
            ) : (
              <List className="mr-1 size-3.5" />
            )}
            {density}
          </Button>
        )}

        <ExportButton format={ExportFormat.PARQUET} rows={filteredLogs} />
        <ExportButton format={ExportFormat.JSONL} rows={filteredLogs} />
      </div>
    </section>
  );
}
