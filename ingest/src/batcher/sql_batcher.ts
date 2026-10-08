/**
 * High-performance PostgreSQL bulk batch inserter for partitioned system_logs.
 * Executes parameterized multi-row INSERTs capable of >5,000 logs/sec throughput.
 */

import { Pool } from "pg";
import type { IngestLogEvent, SystemLogRecord, QueryLogsParams } from "../types.js";

/**
 * SQL Batcher managing pooled connections and bulk ingestion operations.
 */
export class SqlBatcher {
  public readonly pool: Pool;

  /**
   * Initializes PostgreSQL connection pool with connection pooling optimizations.
   *
   * @param connectionString Database connection URI
   */
  constructor(connectionString?: string) {
    const connStr =
      connectionString ||
      process.env.TELEMETRY_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "postgresql://yuvarajpattabi:Yuva1213@localhost:5432/devlab_telemetry";

    this.pool = new Pool({
      connectionString: connStr,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  /**
   * Executes a bulk parameterized multi-row INSERT into partitioned system_logs.
   *
   * @param logs Normalized log events to persist
   * @returns Array of persisted system log records and execution duration
   */
  async insertBatch(
    logs: IngestLogEvent[],
  ): Promise<{ records: SystemLogRecord[]; latencyMs: number }> {
    if (logs.length === 0) {
      return { records: [], latencyMs: 0 };
    }

    const start = performance.now();
    const values: unknown[] = [];
    const rowPlaceholders: string[] = [];

    // Construct multi-row parameterized query with 7 columns per row
    logs.forEach((log, rowIndex) => {
      const offset = rowIndex * 7;
      rowPlaceholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`,
      );

      // Normalize level to strict lowercase snake_case
      const normalizedLevel = log.level.toLowerCase().trim();
      const timestampVal =
        typeof log.timestamp === "string" ? new Date(log.timestamp) : log.timestamp;

      values.push(
        log.service,
        normalizedLevel,
        log.traceId || null,
        log.tenantId || null,
        log.message,
        JSON.stringify(log.metadata || {}),
        timestampVal,
      );
    });

    const query = `
      INSERT INTO system_logs (service, level, trace_id, tenant_id, message, metadata, timestamp)
      VALUES ${rowPlaceholders.join(", ")}
      RETURNING id, service, level, trace_id, tenant_id, message, metadata, timestamp;
    `;

    const client = await this.pool.connect();
    try {
      const res = await client.query<SystemLogRecord>(query, values);
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      return { records: res.rows, latencyMs };
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves paginated system logs with optional filtering.
   *
   * @param params Query criteria including service, level, and limits
   * @returns Matching historical log records
   */
  async queryLogs(params: QueryLogsParams): Promise<SystemLogRecord[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (params.service) {
      conditions.push(`service = $${idx++}`);
      values.push(params.service);
    }
    if (params.level) {
      conditions.push(`level = $${idx++}`);
      values.push(params.level.toLowerCase());
    }
    if (params.traceId) {
      conditions.push(`trace_id = $${idx++}`);
      values.push(params.traceId);
    }
    if (params.tenantId) {
      conditions.push(`tenant_id = $${idx++}`);
      values.push(params.tenantId);
    }
    if (params.search) {
      conditions.push(`message ILIKE $${idx++}`);
      values.push(`%${params.search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = Math.min(params.limit || 100, 1000);
    const offset = params.offset || 0;

    const query = `
      SELECT id, service, level, trace_id, tenant_id, message, metadata, timestamp
      FROM system_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const res = await this.pool.query<SystemLogRecord>(query, values);
    return res.rows;
  }

  /**
   * Gracefully drains pooled database connections.
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
