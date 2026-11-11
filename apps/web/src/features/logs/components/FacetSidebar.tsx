/**
 * @file apps/web/src/features/logs/components/FacetSidebar.tsx
 * @description Splunk/Datadog-style collapsible facet and field discovery sidebar.
 * Computes live frequency distributions for services, severity levels, and traces.
 * @module @devlab/logs-web/features/logs/components/FacetSidebar
 */

"use client";

import React, { useMemo, useState } from "react";
import { Filter, ChevronLeft, ChevronRight, GitBranch, Search } from "lucide-react";
import { Button, Input, ScrollArea } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import type { LogLevel, ServiceName, LogEvent } from "../types";
import { computeFacetDistributions } from "./facet-utils";
import { FacetServicesGroup } from "./FacetServicesGroup";
import { FacetLevelsGroup } from "./FacetLevelsGroup";

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
}: FacetSidebarProps): React.JSX.Element {
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
      <aside className="dl-facets--collapsed">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="dl-facets__toggle-btn"
          title="Expand Field Facets"
        >
          <ChevronRight className="dl-facets__toggle-icon" />
        </Button>
        <div className="dl-facets__vertical-label">
          <Filter className="dl-facets__filter-icon" />
          <span>Facets</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="dl-facets">
      {/* Sidebar Header */}
      <div className="dl-facets__header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--foreground)",
          }}
        >
          <Filter className="dl-facets__filter-icon--md" style={{ color: "var(--primary)" }} />
          <span>Fields & Facets</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="dl-facets__collapse-btn"
          title="Collapse Facets Sidebar"
        >
          <ChevronLeft className="dl-facets__filter-icon--md" />
        </Button>
      </div>

      <div
        style={{
          borderBottom: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
          padding: "0.5rem",
        }}
      >
        <Input
          value={facetSearch}
          onChange={(e) => setFacetSearch(e.target.value)}
          placeholder={UI_COPY.LOGS.FILTERS.FILTER_KEYS_PLACEHOLDER}
          startIcon={
            <Search
              className="dl-facets__filter-icon--md"
              style={{ color: "var(--mutedForeground)" }}
            />
          }
          className="dl-facets__search-input"
          style={{ height: "1.75rem" }}
        />
      </div>

      <ScrollArea style={{ flex: "1 1 0%", padding: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            paddingRight: "0.25rem",
          }}
        >
          <FacetServicesGroup
            filteredServices={filteredServices}
            services={services}
            toggleService={toggleService}
            isolateService={isolateService}
            clearServices={() => setServices([])}
          />

          <FacetLevelsGroup
            levels={levels}
            levelCounts={levelCounts}
            toggleLevel={toggleLevel}
            clearLevels={() => setLevels([])}
          />

          {/* Trace Status Group */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.375rem",
                fontSize: "0.625rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--mutedForeground)",
              }}
            >
              <GitBranch className="dl-facets__category-icon" style={{ color: "var(--ai)" }} />
              Traces
            </div>
            <div
              onClick={() => setTraceFilter(traceFilter ? "" : "trace_")}
              className={cn("dl-facets__item", traceFilter && "dl-facets__item--active")}
            >
              <span>Correlated Traces</span>
              <span
                style={{
                  color: "var(--mutedForeground)",
                  fontSize: "0.625rem",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {tracesCount}
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
