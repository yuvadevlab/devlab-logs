/**
 * @file apps/web/src/features/logs/context/ExplorerContext.tsx
 * @description Centralized React Context providing live telemetry streaming, filters, and modal states.
 * Eliminates duplicate AppNavbar mounts and preserves stream state across route transitions.
 * @module @devlab/logs-web/features/logs/context
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "@devlab-logs/ui";
import { useLogsQuery } from "../api/get-logs";
import { useLiveStream } from "../api/use-live-stream";
import { useConsoleFilters } from "../components/useConsoleFilters";
import { UI_COPY } from "@/lib/ui-copy";
import { Environment, StreamState, TimeRangeKey, type LogEvent, type TimeWindow } from "../types";

const MAX_BUFFER = 5000;

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export interface ExplorerContextValue {
  // Live Stream State
  now: number;
  logs: LogEvent[];
  stream: StreamState;
  rateHist: number[];
  errHist: number[];
  p95: number;
  eps: number;
  bufferCount: number;
  maxBuffer: number;
  togglePause: () => void;
  clearLogs: () => void;

  // Filters & Time Range
  filterState: ReturnType<typeof useConsoleFilters>;
  env: Environment;
  setEnv: (env: Environment) => void;
  range: TimeRangeKey;
  setRange: (r: TimeRangeKey) => void;
  custom: TimeWindow;
  setCustom: React.Dispatch<React.SetStateAction<TimeWindow>>;
  autoScroll: boolean;
  setAutoScroll: (v: boolean | ((p: boolean) => boolean)) => void;

  // Workbench & Dialog State
  sqlOpen: boolean;
  setSqlOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cmdOpen: boolean;
  setCmdOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // View Layout
  showTimeline: boolean;
  setShowTimeline: React.Dispatch<React.SetStateAction<boolean>>;
  density: "compact" | "comfortable";
  setDensity: React.Dispatch<React.SetStateAction<"compact" | "comfortable">>;
  facetsCollapsed: boolean;
  setFacetsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export interface ExplorerProviderProps {
  children: React.ReactNode;
}

/**
 * Centralized Explorer Provider managing telemetry WebSocket, filters, and workbench states.
 */
export function ExplorerProvider({ children }: ExplorerProviderProps) {
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
  const [sqlOpen, setSqlOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const eps = rateHist[rateHist.length - 1] ?? 0;
  const bufferCount = logs.length;

  const handleClearLogs = useCallback(() => {
    clearLogs();
    toast.success(UI_COPY.LOGS.NOTIFICATIONS.BUFFER_CLEARED);
  }, [clearLogs]);

  const handleSetRange = useCallback(
    (r: TimeRangeKey) => {
      filterState.setRange(r);
      filterState.setZoom(null);
    },
    [filterState],
  );

  const value: ExplorerContextValue = useMemo(
    () => ({
      now,
      logs,
      stream,
      rateHist,
      errHist,
      p95,
      eps,
      bufferCount,
      maxBuffer: MAX_BUFFER,
      togglePause,
      clearLogs: handleClearLogs,
      filterState,
      env: filterState.env,
      setEnv: filterState.setEnv,
      range: filterState.range,
      setRange: handleSetRange,
      custom: filterState.custom,
      setCustom: filterState.setCustom,
      autoScroll: filterState.autoScroll,
      setAutoScroll: filterState.setAutoScroll,
      sqlOpen,
      setSqlOpen,
      cmdOpen,
      setCmdOpen,
      showTimeline,
      setShowTimeline,
      density,
      setDensity,
      facetsCollapsed,
      setFacetsCollapsed,
      selectedIndex,
      setSelectedIndex,
    }),
    [
      now,
      logs,
      stream,
      rateHist,
      errHist,
      p95,
      eps,
      bufferCount,
      togglePause,
      handleClearLogs,
      filterState,
      handleSetRange,
      sqlOpen,
      cmdOpen,
      showTimeline,
      density,
      facetsCollapsed,
      selectedIndex,
    ],
  );

  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
}

/**
 * Hook to access the centralized telemetry explorer context.
 */
export function useExplorerContext(): ExplorerContextValue {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error("useExplorerContext must be used within an ExplorerProvider");
  }
  return context;
}
