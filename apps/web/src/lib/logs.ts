/**
 * Telemetry log utilities, severity class mappings, and timestamp formatters.
 */

import { LogLevel, ServiceName } from "./constants/enums";
import type { LogEvent } from "@/features/logs/types";

export const LEVEL_CLASS: Record<LogLevel, string> = {
  [LogLevel.FATAL]: "lvl-fatal",
  [LogLevel.ERROR]: "lvl-error",
  [LogLevel.WARN]: "lvl-warn",
  [LogLevel.INFO]: "lvl-info",
  [LogLevel.DEBUG]: "lvl-debug",
};

/**
 * Formats delta milliseconds into relative time string.
 */
export function fmtRel(ts: number, now: number): string {
  const d = now - ts;
  if (d < 1000) return `+${Math.max(0, Math.round(d))}ms`;
  if (d < 60000) return `${Math.round(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.round(d / 60000)}m ago`;
  return `${Math.round(d / 3600000)}h ago`;
}

/**
 * Formats timestamp into clean ISO representation.
 */
export function fmtIso(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").replace("Z", "");
}

let seq = 0;

/**
 * Normalizes raw payload from ingest WebSocket or REST endpoint into a canonical LogEvent.
 */
export function normalizeBackendLog(raw: Record<string, unknown>): LogEvent {
  const levelStr = String(raw.level || "INFO").toUpperCase();
  const level: LogLevel =
    levelStr in LogLevel ? (LogLevel as Record<string, LogLevel>)[levelStr] : LogLevel.INFO;

  const svcStr = String(raw.service || ServiceName.API_GATEWAY);
  const matchedService = Object.values(ServiceName).find((s) => s === svcStr);
  const service: ServiceName = matchedService ?? ServiceName.API_GATEWAY;

  const meta = (
    typeof raw.metadata === "object" && raw.metadata !== null ? raw.metadata : raw.meta || {}
  ) as Record<string, unknown>;

  const ts =
    typeof raw.timestamp === "string"
      ? new Date(raw.timestamp).getTime()
      : typeof raw.ts === "number"
        ? raw.ts
        : Date.now();

  const traceId = String(raw.trace_id || raw.traceId || "");
  const spanId = String(meta.span_id || raw.spanId || "");
  const parentSpanId = (meta.parent_span_id || raw.parentSpanId || null) as string | null;
  const latency =
    typeof meta.latency_ms === "number"
      ? meta.latency_ms
      : typeof raw.latency === "number"
        ? raw.latency
        : 0;

  return {
    id: ++seq,
    ts,
    level,
    service,
    traceId,
    spanId,
    parentSpanId,
    message: String(raw.message || ""),
    latency,
    meta: {
      ...meta,
      service,
      level: level.toLowerCase(),
      trace_id: traceId,
      span_id: spanId,
    },
  };
}
