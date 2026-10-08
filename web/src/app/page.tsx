"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "../components/Navbar";
import { StatsOverview } from "../components/StatsOverview";
import { LogFilters } from "../components/LogFilters";
import { LogWaterfall } from "../components/LogWaterfall";
import { RagSearchDrawer } from "../components/RagSearchDrawer";
import type { LogFilterState, TelemetryLog, TelemetryMetrics } from "../lib/types";
import { API_BASE_URL, WS_STREAM_URL } from "../lib/constants";

/**
 * Enterprise Telemetry & Observability Studio dashboard shell.
 */
export default function ObservabilityStudioPage() {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRagOpen, setIsRagOpen] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [filters, setFilters] = useState<LogFilterState>({
    service: "all",
    level: "all",
    search: "",
  });

  const wsRef = useRef<WebSocket | null>(null);

  // 1. Initial historical logs fetch
  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/logs?limit=100`);
        if (res.ok) {
          const data = (await res.json()) as { logs: TelemetryLog[] };
          // Reverse so newest appears at the bottom in waterfall stream
          setLogs(data.logs ? [...data.logs].reverse() : []);
        }
      } catch (err) {
        console.warn("[Studio] Could not fetch initial logs:", err);
      }
    };
    void fetchInitialLogs();
  }, []);

  // 2. WebSocket live stream listener with auto-reconnection
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connectWs = () => {
      const ws = new WebSocket(WS_STREAM_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const newLog = JSON.parse(event.data) as TelemetryLog;
          setLogs((prev) => [...prev.slice(-2000), newLog]);
        } catch (err) {
          console.error("[Studio] Failed to parse stream message:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, []);

  // 3. Compute telemetry metrics
  const metrics: TelemetryMetrics = useMemo(() => {
    const errorCount = logs.filter((l) => l.level === "error").length;
    const warnCount = logs.filter((l) => l.level === "warn").length;
    const services = new Set(logs.map((l) => l.service));

    return {
      totalCount: logs.length,
      errorCount,
      warnCount,
      activeStreams: Math.max(services.size, 1),
      avgLatencyMs: 14.5,
    };
  }, [logs]);

  // 4. Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.service !== "all" && log.service !== filters.service) return false;
      if (filters.level !== "all" && log.level !== filters.level) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesMsg = log.message.toLowerCase().includes(term);
        const matchesTrace = log.trace_id?.toLowerCase().includes(term);
        if (!matchesMsg && !matchesTrace) return false;
      }
      return true;
    });
  }, [logs, filters]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <Navbar isConnected={isConnected} onOpenRag={() => setIsRagOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        {/* KPI Banner */}
        <StatsOverview metrics={metrics} />

        {/* Filter Toolbar */}
        <LogFilters
          filters={filters}
          onFilterChange={setFilters}
          isAutoScroll={isAutoScroll}
          onToggleAutoScroll={() => setIsAutoScroll((prev) => !prev)}
          onClearLogs={() => setLogs([])}
        />

        {/* Waterfall Stream */}
        <LogWaterfall logs={filteredLogs} isAutoScroll={isAutoScroll} />
      </main>

      {/* Semantic Log-RAG Modal */}
      <RagSearchDrawer isOpen={isRagOpen} onClose={() => setIsRagOpen(false)} />
    </div>
  );
}
