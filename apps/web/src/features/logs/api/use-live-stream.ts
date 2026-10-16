"use client";

/**
 * Real-time WebSocket streaming manager with live telemetry statistics.
 * Strictly streams real events from DevLab Ingestion Gateway without synthetic generation.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { WS_STREAM_URL, StreamState, LogLevel } from "@/lib/constants";
import { normalizeBackendLog } from "@/lib/logs";
import type { LogEvent } from "../types";

const MAX_BUFFER = 5000;

export interface UseLiveStreamOptions {
  initialLogs?: LogEvent[];
  maxBuffer?: number;
}

export function useLiveStream({
  initialLogs = [],
  maxBuffer = MAX_BUFFER,
}: UseLiveStreamOptions = {}) {
  const [logs, setLogs] = useState<LogEvent[]>(initialLogs);
  const [stream, setStream] = useState<StreamState>(StreamState.RECONNECTING);
  const [rateHist, setRateHist] = useState<number[]>(() => Array(30).fill(0));
  const [errHist, setErrHist] = useState<number[]>(() => Array(30).fill(0));
  const [p95, setP95] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const tickCount = useRef(0);

  // Sync initial logs when query completes
  useEffect(() => {
    if (initialLogs.length > 0 && logs.length === 0) {
      const timer = setTimeout(() => {
        setLogs((prev) => (prev.length === 0 ? initialLogs : prev));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialLogs, logs.length]);

  // Connect to live WebSocket stream
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return;
      try {
        const ws = new WebSocket(WS_STREAM_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isCleanedUp) {
            setStream(StreamState.LIVE);
          }
        };

        ws.onmessage = (event) => {
          if (stream === StreamState.PAUSED) return;
          try {
            const raw = JSON.parse(event.data as string) as Record<string, unknown>;
            const eventLog = normalizeBackendLog(raw);
            tickCount.current += 1;
            setLogs((prev) => {
              const next = prev.concat([eventLog]);
              return next.length > maxBuffer ? next.slice(-maxBuffer) : next;
            });
          } catch (err) {
            console.error("[WebSocket] Failed to parse event payload:", err);
          }
        };

        ws.onclose = () => {
          if (!isCleanedUp) {
            setStream((s) =>
              s === StreamState.PAUSED ? StreamState.PAUSED : StreamState.RECONNECTING,
            );
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (!isCleanedUp) {
          setStream(StreamState.RECONNECTING);
          reconnectTimer = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isCleanedUp = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [stream, maxBuffer]);

  // Compute EPS and sliding sparkline metrics every second
  useEffect(() => {
    const timer = setInterval(() => {
      const c = tickCount.current;
      tickCount.current = 0;
      setRateHist((h) => [...h.slice(1), c]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute rolling error rate percentage and true p95 latency from buffer
  useEffect(() => {
    const timer = setInterval(() => {
      const cut = Date.now() - 60e3;
      const recent = logs.filter((l) => l.ts > cut);
      const errors = recent.filter(
        (l) => l.level === LogLevel.ERROR || l.level === LogLevel.FATAL,
      ).length;
      setErrHist((h) => [...h.slice(1), recent.length ? (errors / recent.length) * 100 : 0]);

      // Calculate true p95 latency from buffer
      if (recent.length > 0) {
        const sortedLatencies = recent.map((l) => l.latency).sort((a, b) => a - b);
        const p95Idx = Math.floor(sortedLatencies.length * 0.95);
        setP95(sortedLatencies[p95Idx] ?? 0);
      } else {
        setP95(0);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [logs]);

  const clearLogs = useCallback(() => setLogs([]), []);

  const togglePause = useCallback(() => {
    setStream((s) => (s === StreamState.PAUSED ? StreamState.LIVE : StreamState.PAUSED));
  }, []);

  return {
    logs,
    stream,
    rateHist,
    errHist,
    p95,
    clearLogs,
    togglePause,
    setLogs,
  };
}
