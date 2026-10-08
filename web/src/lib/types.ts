/**
 * Observability Studio telemetry domain data models and UI state types.
 */

/**
 * Normalized log record matching DevLab Telemetry format.
 */
export interface TelemetryLog {
  id: string;
  service: string;
  level: "info" | "warn" | "error" | string;
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
  service: string;
  level: string;
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
