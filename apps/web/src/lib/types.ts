/**
 * Observability Studio telemetry domain data models and UI state types.
 * Strictly enforces LogLevel and ServiceName canonical enums.
 */

import { LogLevel, ServiceName } from "./constants/enums";

/**
 * Normalized log record matching DevLab Telemetry format.
 */
export interface TelemetryLog {
  id: string;
  service: ServiceName | string;
  level: LogLevel | string;
  trace_id?: string | null;
  tenant_id?: string | null;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Natural language Log-RAG search match with cosine similarity score.
 */
export interface RagEpisodeMatch {
  id: string;
  log_id: string;
  log_timestamp: string;
  service: string;
  summary: string;
  similarity: number;
}

/**
 * Filter criteria for filtering real-time and historical logs.
 */
export interface LogFilterState {
  service: ServiceName | string;
  level: LogLevel | string;
  search: string;
}

/**
 * Aggregated telemetry runtime metrics.
 */
export interface TelemetryMetrics {
  totalCount: number;
  errorCount: number;
  warnCount: number;
  activeStreams: number;
  avgLatencyMs: number;
}
