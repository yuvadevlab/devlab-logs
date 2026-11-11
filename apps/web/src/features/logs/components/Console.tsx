/**
 * @file apps/web/src/features/logs/components/Console.tsx
 * @description Enterprise Telemetry & Log Analytics Console container.
 * Features Splunk/Datadog-grade facets, collapsible timeline, and live waterfall stream.
 * Consumes the central ExplorerContext without mounting a duplicate AppNavbar.
 * @module @devlab/logs-web/features/logs/components/Console
 */

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { LogLevel } from "../types";
import { useExplorerContext } from "../context";
import { LogKpiCards } from "./LogKpiCards";
import { LogHistogram } from "./LogHistogram";
import { LogToolbar } from "./LogToolbar";
import { LogStreamList } from "./LogStreamList";
import { LogDrawer } from "./LogDrawer";
import { FacetSidebar } from "./FacetSidebar";
import { SqlWorkbench } from "./SqlWorkbench";
import { CommandPalette } from "./CommandPalette";

export function Console() {
  const router = useRouter();
  const {
    now,
    logs,
    rateHist,
    errHist,
    p95,
    eps,
    togglePause,
    filterState,
    sqlOpen,
    setSqlOpen,
    cmdOpen,
    setCmdOpen,
    showTimeline,
    setShowTimeline,
    facetsCollapsed,
    setFacetsCollapsed,
    selectedIndex,
    setSelectedIndex,
  } = useExplorerContext();

  const errRate = errHist[errHist.length - 1] ?? 0;
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filterState, selectedIndex, setCmdOpen, setSelectedIndex]);

  const filterCount =
    (filterState.query ? 1 : 0) +
    filterState.services.length +
    filterState.levels.length +
    (filterState.traceFilter ? 1 : 0) +
    (filterState.zoom ? 1 : 0);

  return (
    <div className="dl-console">
      {showTimeline && (
        <section className="dl-console__top-grid">
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

      <div className="dl-console__workspace">
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

        <div className="dl-console__content">
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
            selectedIndex={selectedIndex}
            onRowClick={(idx) => setSelectedIndex(idx)}
          />
        </div>
      </div>

      <LogDrawer
        log={filterState.selected}
        logs={logs}
        onClose={() => filterState.setSelected(null)}
        onSelect={filterState.setSelected}
      />

      <SqlWorkbench open={sqlOpen} onOpenChange={setSqlOpen} logs={logs} />

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onSearchQuery={filterState.setQuery}
        onOpenAi={() => router.push(APP_ROUTES.INVESTIGATE())}
        onOpenSql={() => setSqlOpen(true)}
        onToggleStream={togglePause}
        onFilterErrors={() => filterState.setLevels([LogLevel.ERROR, LogLevel.FATAL])}
        onClearFilters={filterState.clearFilters}
        onSelectService={(s) => filterState.setServices([s])}
      />
    </div>
  );
}
