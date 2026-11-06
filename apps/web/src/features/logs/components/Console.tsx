/**
 * @file apps/web/src/features/logs/components/Console.tsx
 * @description Enterprise Telemetry & Log Analytics Console container.
 * Features Splunk/Datadog-grade facets, collapsible timeline, density toggles, and persistent AI Copilot.
 * @module @devlab/logs-web/features/logs/components/Console
 */

"use client";

import React, { useEffect, useState } from "react";
import { toast } from "@devlab-logs/ui";
import { LogLevel } from "../types";
import { useLogsQuery } from "../api/get-logs";
import { useLiveStream } from "../api/use-live-stream";
import { useConsoleFilters } from "./useConsoleFilters";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { LogKpiCards } from "./LogKpiCards";
import { LogHistogram } from "./LogHistogram";
import { LogToolbar } from "./LogToolbar";
import { LogStreamList } from "./LogStreamList";
import { LogDrawer } from "./LogDrawer";
import { FacetSidebar } from "./FacetSidebar";
import { SqlWorkbench } from "./SqlWorkbench";
import { CommandPalette } from "./CommandPalette";
import { InvestigationCopilotSheet } from "@/features/investigations";
import { UI_COPY } from "@/lib/ui-copy";

const MAX_BUFFER = 5000;

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function Console() {
  const now = useNow(1000);
  const { data: initialLogs = [] } = useLogsQuery();
  const { logs, stream, rateHist, errHist, p95, clearLogs, togglePause } = useLiveStream({
    initialLogs,
    maxBuffer: MAX_BUFFER,
  });

  const filterState = useConsoleFilters(logs, now);
  const [showTimeline, setShowTimeline] = useState(true);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [facetsCollapsed, setFacetsCollapsed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const lastId = logs.length > 0 ? logs[logs.length - 1].id : 0;

  // Global Keyboard Shortcuts (⌘K, j/k row navigation, Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const inInput = activeTag === "input" || activeTag === "textarea";

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
        return;
      }
      if (inInput) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filterState.filtered.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (
        e.key === "Enter" &&
        selectedIndex >= 0 &&
        selectedIndex < filterState.filtered.length
      ) {
        e.preventDefault();
        filterState.setSelected(filterState.filtered[selectedIndex]);
      } else if (e.key === "Escape") {
        filterState.setSelected(null);
        setCopilotOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filterState, selectedIndex]);

  const eps = rateHist[rateHist.length - 1] ?? 0;
  const errRate = errHist[errHist.length - 1] ?? 0;
  const filterCount =
    (filterState.query ? 1 : 0) +
    filterState.services.length +
    filterState.levels.length +
    (filterState.traceFilter ? 1 : 0) +
    (filterState.zoom ? 1 : 0);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden select-none">
      <AppNavbar
        env={filterState.env}
        setEnv={filterState.setEnv}
        stream={stream}
        onToggleStream={togglePause}
        eps={eps}
        bufferCount={logs.length}
        maxBuffer={MAX_BUFFER}
        range={filterState.range}
        setRange={(r) => {
          filterState.setRange(r);
          filterState.setZoom(null);
        }}
        custom={filterState.custom}
        setCustom={filterState.setCustom}
        autoScroll={filterState.autoScroll}
        setAutoScroll={filterState.setAutoScroll}
        onClearLogs={() => {
          clearLogs();
          toast.success(UI_COPY.LOGS.NOTIFICATIONS.BUFFER_CLEARED);
        }}
        onOpenSql={() => setSqlOpen(true)}
        onOpenCopilot={() => setCopilotOpen(true)}
        onOpenCmd={() => setCmdOpen(true)}
      />

      {/* Main Container below Header */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
        {/* Collapsible KPI & Timeline Histogram Section */}
        {showTimeline && (
          <section className="animate-in fade-in grid gap-2.5 transition-all duration-200 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <LogKpiCards
              eps={eps}
              errRate={errRate}
              rateHist={rateHist}
              errHist={errHist}
              env={filterState.env}
              p95={p95}
            />
            <LogHistogram
              logs={filterState.baseFiltered}
              window={filterState.windowRange}
              now={now}
              zoom={filterState.zoom}
              setZoom={filterState.setZoom}
            />
          </section>
        )}

        {/* Main Splunk/Datadog Workbench: Facets Sidebar + Log Stream Area */}
        <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
          <FacetSidebar
            logs={logs}
            services={filterState.services}
            setServices={filterState.setServices}
            levels={filterState.levels}
            setLevels={filterState.setLevels}
            traceFilter={filterState.traceFilter}
            setTraceFilter={filterState.setTraceFilter}
            collapsed={facetsCollapsed}
            onToggleCollapse={() => setFacetsCollapsed((c) => !c)}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
            <LogToolbar
              query={filterState.query}
              setQuery={filterState.setQuery}
              regex={filterState.regex}
              setRegex={filterState.setRegex}
              history={filterState.history}
              services={filterState.services}
              setServices={filterState.setServices}
              levels={filterState.levels}
              setLevels={filterState.setLevels}
              traceFilter={filterState.traceFilter}
              setTraceFilter={filterState.setTraceFilter}
              filteredLogs={filterState.filtered}
              onCommitSearch={filterState.commitSearch}
              showTimeline={showTimeline}
              setShowTimeline={setShowTimeline}
              density={density}
              setDensity={setDensity}
            />

            <LogStreamList
              logs={logs}
              visibleLogs={filterState.filtered}
              now={now}
              isoTime={filterState.isoTime}
              setIsoTime={filterState.setIsoTime}
              autoScroll={filterState.autoScroll}
              setAutoScroll={filterState.setAutoScroll}
              filterCount={filterCount}
              onClearFilters={filterState.clearFilters}
              query={filterState.query}
              regex={filterState.regexPattern}
              expanded={filterState.expanded}
              setExpanded={filterState.setExpanded}
              onSelectLog={filterState.setSelected}
              onTraceFilter={(tid) => filterState.setTraceFilter(tid)}
              lastId={lastId}
              density={density}
              selectedIndex={selectedIndex}
              onRowClick={(idx) => setSelectedIndex(idx)}
            />
          </div>
        </div>
      </div>

      <LogDrawer
        log={filterState.selected}
        logs={logs}
        onClose={() => filterState.setSelected(null)}
        onSelect={filterState.setSelected}
      />

      <InvestigationCopilotSheet open={copilotOpen} onOpenChange={setCopilotOpen} />

      <SqlWorkbench open={sqlOpen} onOpenChange={setSqlOpen} logs={logs} />

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onSearchQuery={filterState.setQuery}
        onOpenAi={() => setCopilotOpen(true)}
        onOpenSql={() => setSqlOpen(true)}
        onToggleStream={togglePause}
        onFilterErrors={() => filterState.setLevels([LogLevel.ERROR, LogLevel.FATAL])}
        onClearFilters={filterState.clearFilters}
        onSelectService={(s) => filterState.setServices([s])}
      />
    </div>
  );
}
