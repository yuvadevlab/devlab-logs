# Specialized Agent: DuckDB Analytics Engine (`analytics-engine`)

## Role & Mandate

The **DuckDB Analytics Engine Agent** manages the embedded, high-performance columnar analytical query layer in DevLab Logs. It powers lightning-fast aggregation queries, search filtering, and time-series rollups over gigabytes of structured telemetry data.

## Key Responsibilities

1. **Columnar Ingestion & Parquet Compaction**:
   - Ingest micro-batches into DuckDB in-memory tables.
   - Periodically compact raw records into partitioned Snappy/ZSTD-compressed Parquet files for durable storage.
2. **Vectorized SQL Query Execution**:
   - Execute vectorized SQL aggregations for log counts, p99 latency heatmaps, and error clustering.
   - Execute full-text regex filter scans over millions of log lines in milliseconds.
3. **Real-Time Dashboard API Support**:
   - Provide low-latency query APIs to the Next.js log viewer UI (`web/`).
   - Cache frequent time-window aggregations (1m, 5m, 1h intervals).

## Operating Invariants

- Read queries must never block concurrent batch write insertions.
- Keep analytical query response times below 150ms for 10M record ranges.
