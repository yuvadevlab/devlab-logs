/**
 * @file apps/web/src/features/logs/components/LogToolbar.tsx
 * @description Operational search bar, active filter pills, view controls, and data export.
 * Eliminates redundant facet selectors by deferring field discovery to FacetSidebar.
 * @module @devlab/logs-web/features/logs/components/LogToolbar
 */

"use client";

import React from "react";
import { Search, GitBranch, X, BarChart3 } from "lucide-react";
import { Button, Input, Badge } from "@devlab-logs/ui";
import { LogLevel, ServiceName, ExportFormat, type LogEvent } from "../types";
import { ExportButton } from "./ExportButton";
import { ActiveFilterPills } from "./ActiveFilterPills";
import { LogSearchHistoryPopover } from "./LogSearchHistoryPopover";
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
    <section
      className="panel"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
      }}
    >
      {/* Search Input with Regex and History */}
      <div style={{ position: "relative", minWidth: "16rem", flex: "1 1 0%" }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCommitSearch()}
          placeholder={regex ? "regex filter, e.g. timeout|OOM" : "Search messages…"}
          startIcon={<Search className="dl-search-icon" />}
          className="dl-toolbar__search-input"
          style={{ height: "2rem", paddingInlineEnd: "10rem" }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "0.25rem",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {regex && query && (
            <Badge
              variant="outline"
              className={regexOk ? "dl-badge--info" : "dl-badge--error"}
              style={{
                padding: "0 0.25rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.5625rem",
              }}
            >
              {regexOk ? "✓ valid" : "✗ invalid"}
            </Badge>
          )}
          <Button
            size="sm"
            variant={regex ? "secondary" : "ghost"}
            onClick={() => setRegex((r) => !r)}
            className="dl-toolbar__search-badge"
            style={{ height: "1.5rem", padding: "0 0.375rem" }}
            title="Toggle regular expressions"
          >
            .*
          </Button>
          <LogSearchHistoryPopover
            history={history}
            onSelectHistory={(h) => {
              setQuery(h);
              setRegex(h.includes("|"));
            }}
          />
        </div>
      </div>

      {/* Trace ID Filter Input */}
      <div style={{ position: "relative" }}>
        <Input
          value={traceFilter}
          onChange={(e) => setTraceFilter(e.target.value)}
          placeholder={UI_COPY.LOGS.FILTERS.TRACE_ID_PLACEHOLDER}
          startIcon={<GitBranch className="dl-toolbar__filter-icon" />}
          className="dl-toolbar__filter-input"
          style={{
            height: "2rem",
            width: "10rem",
            paddingInlineEnd: traceFilter ? "1.75rem" : undefined,
          }}
        />
        {traceFilter && (
          <button
            type="button"
            onClick={() => setTraceFilter("")}
            style={{
              position: "absolute",
              top: "50%",
              right: "0.5rem",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "var(--mutedForeground)",
            }}
            title="Clear trace filter"
          >
            <X className="dl-toolbar__clear-icon" />
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
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.375rem" }}>
        {setShowTimeline && (
          <Button
            size="sm"
            variant={showTimeline ? "secondary" : "outline"}
            onClick={() => setShowTimeline((prev) => !prev)}
            className="dl-toolbar__chart-btn"
            style={{ height: "2rem" }}
            title={UI_COPY.LOGS.TOOLBAR.TOGGLE_TIMELINE}
          >
            <BarChart3 className="dl-toolbar__chart-icon" />
            Timeline
          </Button>
        )}

        <ExportButton format={ExportFormat.PARQUET} rows={filteredLogs} />
        <ExportButton format={ExportFormat.JSONL} rows={filteredLogs} />
      </div>
    </section>
  );
}
