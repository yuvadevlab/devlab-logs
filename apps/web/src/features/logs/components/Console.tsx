"use client";

import React, { useEffect, useState } from "react";
import { toast } from "@yuva-devlab/ui";
import { LogLevel } from "../types";
import { useLogsQuery } from "../api/get-logs";
import { useLiveStream } from "../api/use-live-stream";
import { useConsoleFilters } from "./useConsoleFilters";
import { LogHeader } from "./LogHeader";
import { LogKpiCards } from "./LogKpiCards";
import { LogHistogram } from "./LogHistogram";
import { LogToolbar } from "./LogToolbar";
import { LogStreamList } from "./LogStreamList";
import { LogDrawer } from "./LogDrawer";
import { AiModal } from "./AiModal";
import { SqlWorkbench } from "./SqlWorkbench";
import { CommandPalette } from "./CommandPalette";

const MAX_BUFFER = 5000;

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/**
 * Enterprise Telemetry & Log Analytics Console container.
 */
export function Console() {
  const now = useNow(1000);
  const { data: initialLogs = [] } = useLogsQuery();
  const { logs, stream, rateHist, errHist, p95, clearLogs, togglePause } = useLiveStream({
    initialLogs,
    maxBuffer: MAX_BUFFER,
  });

  const filterState = useConsoleFilters(logs, now);

  const [aiOpen, setAiOpen] = useState(false);
  const [sqlOpen, setSqlOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const lastId = logs.length > 0 ? logs[logs.length - 1].id : 0;

  // Global ⌘K Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const eps = rateHist[rateHist.length - 1] ?? 0;
  const errRate = errHist[errHist.length - 1] ?? 0;
  const filterCount =
    (filterState.query ? 1 : 0) +
    filterState.services.length +
    filterState.levels.length +
    (filterState.traceFilter ? 1 : 0) +
    (filterState.zoom ? 1 : 0);

  return (
    <div className="flex h-screen flex-col gap-3 p-3 select-none">
      <LogHeader
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
          toast.success("Buffer cleared");
        }}
        onOpenSql={() => setSqlOpen(true)}
        onOpenAi={() => setAiOpen(true)}
        onOpenCmd={() => setCmdOpen(true)}
      />

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
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
        levelCounts={filterState.levelCounts}
        onCommitSearch={filterState.commitSearch}
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
      />

      <LogDrawer
        log={filterState.selected}
        logs={logs}
        onClose={() => filterState.setSelected(null)}
        onSelect={filterState.setSelected}
      />
      <AiModal open={aiOpen} onOpenChange={setAiOpen} logs={logs} />
      <SqlWorkbench open={sqlOpen} onOpenChange={setSqlOpen} logs={logs} />

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onSearchQuery={filterState.setQuery}
        onOpenAi={() => setAiOpen(true)}
        onOpenSql={() => setSqlOpen(true)}
        onToggleStream={togglePause}
        onFilterErrors={() => filterState.setLevels([LogLevel.ERROR, LogLevel.FATAL])}
        onClearFilters={filterState.clearFilters}
        onSelectService={(s) => filterState.setServices([s])}
      />
    </div>
  );
}
