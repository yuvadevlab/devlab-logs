/**
 * Canonical types and interfaces for the Telemetry & Log Analytics feature.
 * Strictly enforces enum values and zero magic strings across domain entities.
 */

import {
  LogLevel,
  ServiceName,
  StreamState,
  TimeRangeKey,
  Environment,
  ExportFormat,
  AiAnalysisPhase,
} from "@/lib/constants";

export {
  LogLevel,
  ServiceName,
  StreamState,
  TimeRangeKey,
  Environment,
  ExportFormat,
  AiAnalysisPhase,
};

export type Level = LogLevel;
export type Service = ServiceName;
export type RangeKey = TimeRangeKey;

export const LEVELS: readonly LogLevel[] = [
  LogLevel.FATAL,
  LogLevel.ERROR,
  LogLevel.WARN,
  LogLevel.INFO,
  LogLevel.DEBUG,
] as const;

export const SERVICES: readonly ServiceName[] = [
  ServiceName.API_GATEWAY,
  ServiceName.AUTH_SERVICE,
  ServiceName.PAYMENT_ENGINE,
  ServiceName.FINAI_WORKER,
  ServiceName.ORCHESTRAI_SWARM,
  ServiceName.COLLECTOR_DAEMON,
] as const;

export interface LogEvent {
  id: number;
  ts: number;
  level: LogLevel;
  service: ServiceName;
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  message: string;
  latency: number;
  meta: Record<string, unknown>;
}

export const RANGES = {
  [TimeRangeKey.FIVE_MINUTES]: 5 * 60e3,
  [TimeRangeKey.FIFTEEN_MINUTES]: 15 * 60e3,
  [TimeRangeKey.ONE_HOUR]: 60 * 60e3,
  [TimeRangeKey.TWENTY_FOUR_HOURS]: 24 * 60 * 60e3,
} as const;

export interface TimeWindow {
  from: string;
  to: string;
}

export interface LogEpisodeMatch {
  id: string;
  log_id: string;
  log_timestamp: string;
  service: string;
  summary: string;
  similarity: number;
}

export interface RagSearchResponse {
  query: string;
  matches: LogEpisodeMatch[];
}
