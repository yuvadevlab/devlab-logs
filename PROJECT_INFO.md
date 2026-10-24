# DevLab Logs — Master Product Specification, Technical Dossier & Operations Manual

---

## 1. Product File: Strategic Vision & Telemetry Mandate

### 1.1 Executive Product Summary

**DevLab Logs** is the high-throughput telemetry backbone, distributed log aggregator, and semantic Log-RAG search engine engineered specifically for autonomous AI agent swarms and microservices within the DevLab ecosystem.

In distributed microservice networks executing multi-agent DAGs, traditional centralized logging is inadequate due to blocking HTTP latencies, query slowness, and unindexed telemetry. DevLab Logs solves this via:

1. **Dual-Mode Resilient Ingest Engine (`ingest` — Dev: Port `4003` | Prod: Port `4013`)**: Express-powered ingestion engine with a dual-pipeline architecture: streams to Apache Kafka for production clustering, with seamless automatic fallback to local direct PostgreSQL with pgvector and memory batching for local development.
2. **High-Speed Go Telemetry Collector Daemon (`agent`)**: Minimal-overhead Go agent compiling to a single static binary (<15MB RSS memory), tailing log files with inode tracking and zero-copy circular ring buffering.
3. **Columnar & Vectorized Analytics (`storage`)**: Native PostgreSQL partitioned range tables combined with HNSW cosine distance vector embeddings (`log_embeddings`), enabling sub-10ms semantic similarity queries and Log-RAG incident search.
4. **Next.js 15 Realtime Log Explorer (`web` — Dev: Port `3003` | Prod: Port `3013`)**: Responsive web console offering live WebSocket tail streaming (`/stream`), trace ID correlation, and real-time histogram analysis.

### 1.2 Target Personas & Primary Use Cases

| Persona                                    | Operational Context                                                | Primary Pain Points Addressed                                                              |
| :----------------------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Autonomous AI Agents & Swarms**          | Emitting step-by-step reasoning spans and tool execution latencies | Requires non-blocking, sub-millisecond fire-and-forget telemetry batching.                 |
| **Site Reliability Engineer (IncidentAI)** | Performing forensic postmortems on runtime crashes                 | Needs instant trace correlation across microservices and semantic Log-RAG search.          |
| **Platform Administrator**                 | Monitoring cluster health, token burn rates, and error rate surges | Delivers live tail WebSocket feeds, rate-of-change histograms, and SQL query capabilities. |

---

## 2. Exhaustive Feature Directory & Technical Mechanics

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DEVLAB LOGS TOPOLOGY & TELEMETRY RAILS                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
    [OrchestrAI (:4002)]        [FinAI (:4001)]        [Portal (:4000)]        [Go Daemon Collector]
              │                        │                      │                         │
              └────────────────────────┼──────────────────────┴─────────────────────────┘
                                       │ (HTTP Batch / POST /logs)
                                       ▼
                      [Express Log Ingestion Service (Dev :4003 | Prod :4013)]
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼ (Production Cluster)                                ▼ (Direct / Local Dev)
    [Apache Kafka (:9092)]                                  [PostgreSQL 16 + pgvector]
    (Topic: devlab.logs.v1)                                 (HNSW Semantic Embeddings)
            │                                                     │
            ▼                                                     ▼
    [DuckDB Columnar Store]                                 [Live WebSocket Stream]
    (Historical Parquet Analytics)                          (ws://localhost:4003/stream)
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       ▼
                      [Log Explorer Console (Next.js 15 — Dev :3003 | Prod :3013)]
```

### 2.1 Subsystem Breakdown

#### 1. Ingestion Service (`ingest` — Dev: Port `4003` | Prod: Port `4013`)

- **Technology Stack**: Express v4, TypeScript Node ESM, `@yuva-devlab/logger`, PostgreSQL (`pg`), `ws`.
- **Purpose**: High-throughput HTTP ingestion gateway receiving log entries from all ecosystem members.
- **Detailed Features**:
  - **Dual-Mode Pipeline**: Seamlessly detects whether Kafka is configured. In production, forwards batches to Kafka topic `devlab.logs.v1`. In local development, captures logs directly into PostgreSQL partitioned storage.
  - **Batch Ingestion API**: Supports `POST /api/v1/logs/batch` and `POST /logs` with array payloads for massive batch ingestion efficiency.
  - **WebSocket Live Stream**: Emits real-time log broadcasts on `ws://localhost:4003/stream`.
  - **Semantic Log-RAG Search**: Leverages Ollama (`nomic-embed-text`) embeddings stored in pgvector for sub-10ms similarity search via `/api/v1/logs/rag-search`.

#### 2. Go Telemetry Daemon (`apps/agent`)

- **Technology Stack**: Go 1.27, Goroutines, Channels, HTTP/2 client.
- **Purpose**: Ultra-low-overhead log scraper designed for deployment as a sidecar or daemonset.
- **Detailed Features**:
  - Resource usage: <15MB RSS memory, <1% CPU utilization under load.
  - Native JSON stream parsing and circular ring buffer memory management.

#### 3. Realtime Web Console (`apps/web` — Dev: Port `3003` | Prod: Port `3013`)

- **Technology Stack**: Next.js 15, React 19, Tailwind CSS v4, `@devlab-logs/ui`, `@yuva-devlab/ui`.
- **Purpose**: Interactive log tailing and observability console.
- **Detailed Features**:
  - **Live Tail Mode**: Auto-scrolls streaming log records over WebSocket with sub-50ms latency.
  - **Trace ID Correlation**: Clicking any log line filters all logs matching the same `traceId` across all microservices.
  - **Error Frequency Histograms**: Visual bar charts showing error counts grouped by 1-minute intervals.

---

## 3. Inter-System Ecosystem Collaboration ("How It Works With Others")

```mermaid
sequenceDiagram
    autonumber
    participant App as Monorepo App (OrchestrAI :4002 / FinAI :4001 / Portal :4000)
    participant Ingest as Logs Ingest (:4003 / :4013)
    participant DB as PostgreSQL / pgvector
    participant Web as Log Console (:3003 / :3013)
    participant IA as IncidentAI (:8085)

    App->>Ingest: POST /logs (Batch of structured logs)
    Ingest->>DB: Ingest into partitioned storage & generate vector embeddings
    Ingest-->>App: 202 Accepted { ingested: batch_size }

    Ingest->>Web: WebSocket broadcast to live console (:3003 / :3013)

    alt Log Entry has level == 'FATAL' or 'ERROR' spike
        Ingest->>IA: Emit Incident Alert to IncidentAI (:8085)
    end
```

### 3.1 Inter-Repository Integration Matrix

| Ecosystem Member    | Direction | Protocol & Transport | Exact Payload Contract & Endpoint                     | Purpose & Operational Behavior                                                              |
| :------------------ | :-------: | :------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **`orchestrai`**    |  Inbound  | HTTP POST            | `POST http://localhost:4003/logs` (Prod: `:4013`)     | Workers and Gateways stream execution logs, LLM token counts, and tool metrics.             |
| **`finai`**         |  Inbound  | HTTP POST            | `POST http://localhost:4003/logs` (Prod: `:4013`)     | NestJS backend streams audit logs, bank sync telemetry, and advisory session events.        |
| **`devlab-portal`** |  Inbound  | HTTP POST            | `POST http://localhost:4003/logs` (Prod: `:4013`)     | Streams API key generation, revocation, and RBAC security audit trails.                     |
| **`incidentai`**    | Outbound  | Webhook HTTP POST    | `POST http://localhost:8085/api/v1/incidents/webhook` | Dispatches high-severity error logs to IncidentAI to trigger automated root-cause analysis. |
| **`devlab-guard`**  |  Inbound  | CLI Git Pre-commit   | `uv run devlab-guard scan --path .`                   | Validates monorepo architecture and formatting rules before commit.                         |

---

## 4. Technical Guidelines & Invariant Rules

### 4.1 Prime Non-Negotiable Invariants

1. **Standardized Log Envelope**:
   - Every log record MUST include: `timestamp` (ISO-8601), `level` (`DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`), `service` (string enum), and `message`.
2. **Zero Ingest Blocking**:
   - The ingestion API must NEVER block or drop connections if downstream storage is slow. Backpressure is managed via the circular ring buffer.
3. **Partitioned Monthly Storage**:
   - PostgreSQL logs are partitioned monthly (`system_logs_YYYY_MM`) with GIN indexes on JSONB metadata for sub-millisecond filtering.

---

## 5. Developer Usage Guidelines & Operations Manual

### 5.1 Local Prerequisites & Setup

```bash
# Clone the repository
git clone https://github.com/yuvadevlab/devlab-logs.git
cd devlab-logs

# Install monorepo dependencies
pnpm install

# Start Ingest (:4003) and Web Console (:3003) in development mode
pnpm dev
```

### 5.2 Complete Environment Variables Reference

#### Ingest (`apps/ingest/.env`)

| Variable                 |  Type  | Default                                                        | Required | Description                                             |
| :----------------------- | :----: | :------------------------------------------------------------- | :------: | :------------------------------------------------------ |
| `PORT`                   | Number | `4003` (dev) / `4013` (prod)                                   |   Yes    | Ingest service HTTP port.                               |
| `TELEMETRY_DATABASE_URL` | String | `postgresql://.../devlab_logs`                                 |   Yes    | PostgreSQL connection string with pgvector extension.   |
| `DEVLAB_PORTAL_API_URL`  | String | `http://localhost:4000` (dev) / `http://localhost:4010` (prod) |   Yes    | Portal API URL for OIDC token verification.             |
| `DEVLAB_LOGS_API_KEY`    | String | (secret token)                                                 |   Yes    | Service-to-service credential for authorized ingestion. |

#### Web (`apps/web/.env`)

| Variable                            |  Type  | Default                                                        | Required | Description                                                  |
| :---------------------------------- | :----: | :------------------------------------------------------------- | :------: | :----------------------------------------------------------- |
| `PORT`                              | Number | `3003` (dev) / `3013` (prod)                                   |   Yes    | Next.js log viewer UI port.                                  |
| `NEXT_PUBLIC_API_URL`               | String | `http://localhost:4003` (dev) / `http://localhost:4013` (prod) |   Yes    | Backend Ingest service URL for queries and WebSocket stream. |
| `NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL` | String | `http://localhost:3000` (dev) / `http://localhost:3010` (prod) |   Yes    | Portal Web URL for authentication and login redirects.       |

### 5.3 Shipping Logs via HTTP API Example

```bash
curl -X POST http://localhost:4003/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer devlab_logs_prod_secret_api_key_2026" \
  -d '[
    {
      "timestamp": "2026-10-24T18:00:00.000Z",
      "level": "INFO",
      "service": "finai-api",
      "message": "Financial health score recomputed",
      "traceId": "trace_abc123",
      "metadata": { "userId": "usr_9901", "score": 85 }
    }
  ]'
```
