/**
 * @file apps/web/src/features/logs/components/FacetSidebar.tsx
 * @description Splunk/Datadog-style collapsible facet and field discovery sidebar.
 * Computes live frequency distributions for services, severity levels, and traces.
 * @module @devlab/logs-web/features/logs/components/FacetSidebar
 */

"use client";

import React, { useMemo, useState } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
  AlertTriangle,
  GitBranch,
  Search,
} from "lucide-react";
import { Badge, Button, Input, ScrollArea } from "@devlab-logs/ui";
import { LEVEL_CLASS } from "@/lib/logs";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { LogLevel, ServiceName, LEVELS, type LogEvent } from "../types";
import { computeFacetDistributions } from "./facet-utils";

export interface FacetSidebarProps {
  logs: LogEvent[];
  services: ServiceName[];
  setServices: (s: ServiceName[]) => void;
  levels: LogLevel[];
  setLevels: (l: LogLevel[] | ((p: LogLevel[]) => LogLevel[])) => void;
  traceFilter: string;
  setTraceFilter: (t: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FacetSidebar({
  logs,
  services,
  setServices,
  levels,
  setLevels,
  traceFilter,
  setTraceFilter,
  collapsed = false,
  onToggleCollapse,
}: FacetSidebarProps) {
  const [facetSearch, setFacetSearch] = useState("");

  const { sortedServices, levelCounts, tracesCount } = useMemo(
    () => computeFacetDistributions(logs),
    [logs],
  );

  const filteredServices = useMemo(() => {
    if (!facetSearch.trim()) return sortedServices;
    const q = facetSearch.toLowerCase();
    return sortedServices.filter(([svc]) => svc.toLowerCase().includes(q));
  }, [sortedServices, facetSearch]);

  const toggleService = (s: ServiceName) => {
    setServices(services.includes(s) ? services.filter((x) => x !== s) : [...services, s]);
  };

  const isolateService = (svc: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setServices([svc as ServiceName]);
  };

  const toggleLevel = (lv: LogLevel) => {
    setLevels((prev) => (prev.includes(lv) ? prev.filter((x) => x !== lv) : [...prev, lv]));
  };

  if (collapsed) {
    return (
      <aside className="border-border/60 bg-card/40 flex w-10 flex-col items-center border-r py-3 transition-all select-none">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="size-7 p-0"
          title="Expand Field Facets"
        >
          <ChevronRight className="size-4" />
        </Button>
        <div className="text-muted-foreground mt-4 flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase [writing-mode:vertical-rl]">
          <Filter className="size-3" />
          <span>Facets</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-border/60 bg-card/30 flex w-60 shrink-0 flex-col border-r font-mono text-xs backdrop-blur-xs select-none">
      {/* Sidebar Header */}
      <div className="border-border/50 flex items-center justify-between border-b px-3 py-2">
        <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
          <Filter className="text-primary size-3.5" />
          <span>Fields & Facets</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="size-6 p-0"
          title="Collapse Facets Sidebar"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
      </div>

      <div className="border-border/40 border-b p-2">
        <Input
          value={facetSearch}
          onChange={(e) => setFacetSearch(e.target.value)}
          placeholder={UI_COPY.LOGS.FILTERS.FILTER_KEYS_PLACEHOLDER}
          startIcon={<Search className="text-muted-foreground size-3.5" />}
          className="h-7 font-mono text-[11px]"
        />
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-4 pr-1">
          {/* Services Group */}
          <div>
            <div className="text-muted-foreground flex items-center justify-between px-1.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1">
                <Layers className="text-primary size-3" />
                Services ({filteredServices.length})
              </span>
              {services.length > 0 && (
                <button
                  type="button"
                  onClick={() => setServices([])}
                  className="text-primary cursor-pointer lowercase hover:underline"
                >
                  reset
                </button>
              )}
            </div>
            <div className="mt-1 space-y-0.5">
              {filteredServices.map(([svc, count]) => {
                const isSelected = services.includes(svc as ServiceName);
                return (
                  <div
                    key={svc}
                    onClick={() => toggleService(svc as ServiceName)}
                    className={`group hover:bg-accent/60 flex cursor-pointer items-center justify-between rounded px-2 py-1 transition ${isSelected ? "bg-accent text-accent-foreground font-medium" : "text-foreground/80"}`}
                  >
                    <span className="max-w-[130px] truncate">{svc}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => isolateService(svc, e)}
                        title="Only"
                        className="text-primary text-[10px] opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                      >
                        only
                      </button>
                      <span className="text-muted-foreground text-[10px] tabular-nums">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Group */}
          <div>
            <div className="text-muted-foreground flex items-center justify-between px-1.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1">
                <AlertTriangle className="text-warn size-3" />
                Levels
              </span>
              {levels.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLevels([])}
                  className="text-primary cursor-pointer lowercase hover:underline"
                >
                  reset
                </button>
              )}
            </div>
            <div className="mt-1 space-y-0.5">
              {LEVELS.map((lv) => {
                const isSelected = levels.includes(lv);
                const count = levelCounts[lv];
                return (
                  <div
                    key={lv}
                    onClick={() => toggleLevel(lv)}
                    className={`hover:bg-accent/60 flex cursor-pointer items-center justify-between rounded px-2 py-1 transition ${isSelected ? "bg-accent font-semibold" : ""}`}
                  >
                    <Badge
                      variant="outline"
                      className={cn("px-1 py-0 font-mono text-[9px]", LEVEL_CLASS[lv])}
                    >
                      {lv}
                    </Badge>
                    <span className="text-muted-foreground text-[10px] tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trace Status Group */}
          <div>
            <div className="text-muted-foreground flex items-center gap-1 px-1.5 py-1 text-[10px] font-semibold tracking-wider uppercase">
              <GitBranch className="text-ai size-3" />
              Traces
            </div>
            <div
              onClick={() => setTraceFilter(traceFilter ? "" : "trace_")}
              className={`hover:bg-accent/60 flex cursor-pointer items-center justify-between rounded px-2 py-1 transition ${traceFilter ? "bg-accent font-semibold" : ""}`}
            >
              <span>Correlated Traces</span>
              <span className="text-muted-foreground text-[10px] tabular-nums">{tracesCount}</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
