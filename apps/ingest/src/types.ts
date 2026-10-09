/**
 * Canonical types and schemas for the DevLab Telemetry ingestion pipeline.
 * Adheres to strict lowercase snake_case database schema standards.
 */

import { z } from "zod";

/**
 * Validation schema for incoming log events transmitted by devlab-log-agent.
 */
export const IngestLogEventSchema = z.object({
  service: z.string().min(1).max(64),
  stream: z.string().default("stdout"),
  level: z.string().min(1).max(16),
  traceId: z.string().max(64).optional(),
  tenantId: z.string().max(64).optional(),
  message: z.string(),
  metadata: z.record(z.unknown()).optional().default({}),
  timestamp: z.string().or(z.date()),
});

/**
 * TypeScript inferred type for validated incoming telemetry log payload.
 */
export type IngestLogEvent = z.infer<typeof IngestLogEventSchema>;

/**
 * Persisted system log record matching PostgreSQL system_logs schema.
 */
export interface SystemLogRecord {
  id: string;
  service: string;
  level: string;
  trace_id: string | null;
  tenant_id: string | null;
  message: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Filter parameters for querying historical logs from system_logs.
 */
export interface QueryLogsParams {
  service?: string;
  level?: string;
  traceId?: string;
  tenantId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Vector search match representation retrieved from log_embeddings.
 */
export interface LogEpisodeMatch {
  id: string;
  log_id: string;
  log_timestamp: Date;
  service: string;
  summary: string;
  similarity: number;
}
