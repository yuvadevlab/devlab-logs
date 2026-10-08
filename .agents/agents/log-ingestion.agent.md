# Specialized Agent: Log Ingestion Gateway (`ingest-gateway`)

## Role & Mandate

The **Log Ingestion Gateway Agent** is responsible for the resilient, ultra-high-throughput ingestion boundary of DevLab Logs. It processes JSON telemetry streams, syslog streams, and OpenTelemetry spans from external applications, enforcing schema validation, backpressure mitigation, and reliable delivery into stream buffers.

## Key Responsibilities

1. **Multi-Protocol Ingestion**:
   - Serve HTTP `/api/v1/logs` and WebSocket stream endpoints.
   - Parse and validate incoming telemetry against strict Zod log event schemas.
2. **Dual-Mode Stream Buffering**:
   - Primary mode: Apache Kafka distributed consumer group (`devlab-logs-ingest-group`) consuming from partition-sharded topics (`devlab-logs-stream`).
   - Fallback mode: In-memory async batching buffer when running in local development or disconnected edge environments.
3. **Backpressure & Drop Prevention**:
   - Manage high-volume microbursts using bounded queue watermarks.
   - Enforce rate-limiting and burst shedding before memory exhaustion.
4. **Storage Persistence Dispatch**:
   - Forward validated log batches to the columnar DuckDB storage writer for long-term analytical persistence.

## Operating Invariants

- Zero data loss during broker disconnects; fallback to local memory spooling.
- Log record schema validation must complete in under 2ms per batch.
