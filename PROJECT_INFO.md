# DevLab Logs — Deep Product & Technical Specification Dossier

## 1. Product Overview & Vision

### 1.1 The Operational Problem Space

AI Agent Swarms (such as OrchestraI and FinAI) generate an order of magnitude more telemetry than traditional microservices. A single autonomous execution session may trigger dozens of model calls, dynamic tool invocations, AST validations, sandbox runs, and state transitions. Traditional logging stacks (e.g. Elasticsearch/Logstash/Kibana or Datadog) encounter severe bottlenecks:

- **Elasticsearch Indexing Overhead**: Heavy inverted indices consume massive JVM heap, driving operational costs higher than the LLM execution itself.
- **Agent Footprint Lag**: Node or Python-based log collectors introduce heavy memory footprints and CPU contention on edge nodes.
- **Slow Analytical Queries**: Row-oriented databases choke when performing p95/p99 latency calculations across millions of distributed agent traces.

### 1.2 The DevLab Logs Solution

DevLab Logs introduces a **purpose-built, hybrid polyglot architecture**:

1. **Zero-Overhead Edge Collection in Go**: An edge daemon that tails files, collects system metrics, and streams events with <30MB RAM and negligible CPU.
2. **Dual-Mode Resilient Ingestion Gateway**: Node.js stream gateway that supports both high-throughput Apache Kafka partitions and an in-memory ring buffer for local development.
3. **Columnar Vectorized Storage with DuckDB**: Eliminates heavyweight search clusters by writing columnar Parquet micro-batches directly to DuckDB, enabling sub-100ms analytical queries without massive index overhead.
4. **Instant Web UI in Next.js**: Real-time log streamer and trace analyzer with live regex filtering.

---

## 2. Technical Stack & Architectural Rationale

### 2.1 Language Breakdown: Polyglot by Design

#### 1. Go 1.27 (`agent/`)

- **Why Go for the Collector?**
  - **Single Static Binary**: Deploys without runtime dependencies (no JVM, no Node runtime, no Python virtualenv).
  - **Minimal Memory Footprint**: Uses <30MB RSS vs 150MB+ for a typical Node/JVM agent.
  - **Goroutine Concurrency**: Millions of concurrent file tailing channels and non-blocking network flushes handled effortlessly.
  - **Predictable GC Latencies**: Circular ring buffers prevent frequent heap allocations, eliminating GC pauses that could cause log drops.

#### 2. TypeScript & Node.js (`ingest/`, `web/`)

- **Why TypeScript for Ingest & Web?**
  - **Fast JSON Serialization**: Node.js V8 engine is exceptionally fast at parsing JSON payloads streamed by webhooks and HTTP clients.
  - **Rich Event Ecosystem**: Native integration with `kafkajs`, `express`, and `@yuva-devlab/logger`.
  - **Unified Frontend/Backend Stack**: Next.js 15 app shares exact TypeScript log schemas with the backend ingestion pipelines.

---

### 2.2 Storage & Streaming Choices

| Component           | Selected Technology          | Why Selected Over Alternatives                                                                                                                                                                                 |
| :------------------ | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stream Buffer**   | **Apache Kafka** (Dual Mode) | Provides partitioned log topics, consumer groups, replayability, and backpressure decoupling. In local mode, seamlessly swaps to an in-memory queue.                                                           |
| **Analytical DB**   | **DuckDB (Columnar)**        | Replaces heavyweight Elasticsearch clusters. DuckDB executes vectorized columnar SQL scans over Parquet data up to 100x faster than SQLite/Postgres for time-series aggregations with zero daemon maintenance. |
| **UI Framework**    | **Next.js 15 (React)**       | Server Components provide fast initial SSR load for log dashboards, with client hydration for real-time WebSocket stream tailing.                                                                              |
| **Monorepo Engine** | **Turborepo**                | Coordinates concurrent build, lint, and dev pipelines across Go and TypeScript with remote caching.                                                                                                            |

---

## 3. System Architecture & Directory Structure

```
devlab-logs/
├── agent/                      # Go edge telemetry collection daemon
│   ├── cmd/main.go             # CLI entrypoint and configuration reader
│   ├── config/                 # YAML configuration parsing
│   ├── collector/              # File tailer and inode tracker
│   └── producer/               # Concurrency-safe circular ring buffer & HTTP client
├── ingest/                     # Stream ingestion service
│   └── src/
│       ├── consumers/          # Kafka consumer group worker & in-memory fallback
│       ├── routes/             # Ingestion HTTP routes
│       └── services/           # Storage writer & DuckDB batcher
├── storage/                    # DuckDB database connection and query abstractions
├── web/                        # Next.js web application
│   ├── src/app/                # App router pages (dashboard, explorer, settings)
│   └── src/components/         # Virtualized log stream tables and charts
├── .vscode/                    # Excludes 16k node_modules files from watchers
└── package.json                # Root pnpm monorepo configuration
```

---

## 4. Performance & Scalability Guarantees

1. **Ingestion Throughput**: Handles up to 25,000 log events/second per ingestion node when backed by Kafka.
2. **Edge Resource Footprint**: Go agent guarantees <30MB resident memory and <2% CPU usage.
3. **Query Latency**: DuckDB columnar engine evaluates aggregations (e.g. `COUNT(*) GROUP BY error_code`) across 10 million rows in under 120ms.
4. **Zero-Drop Backpressure**: If ingest endpoints become temporarily unreachable, the Go agent spools records to disk with bounded FIFO eviction.
