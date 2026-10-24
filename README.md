# DevLab Logs — Enterprise Distributed Telemetry & High-Throughput Log Analytics

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/go-1.27.1-00ADD8" alt="Go" />
  <img src="https://img.shields.io/badge/typescript-5.8.2-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/turbo-2.11.7-red" alt="Turbo" />
  <img src="https://img.shields.io/badge/duckdb-columnar-yellow" alt="DuckDB" />
  <img src="https://img.shields.io/badge/kafka-event--stream-black" alt="Kafka" />
</p>

**DevLab Logs** is a hybrid high-throughput log collection, stream ingestion, and columnar analytics platform designed specifically for distributed AI agent swarms and microservices. It unifies edge telemetry collection, event buffering, and analytical querying into an integrated monorepo.

---

## ⚡ Architecture & Pipeline

```mermaid
graph LR
    subgraph Edge Collection
        A[Go Agent Daemon<br/>apps/agent/cmd/main.go] -->|Batch HTTP / gRPC| B[Ingest Gateway<br/>Node.js / Express]
        App[Apps / Containers] -->|Direct HTTP| B
    end

    subgraph Buffering & Ingestion
        B -->|Producer| C[(Apache Kafka / Local Buffer)]
        C -->|Consumer Group| D[Kafka Consumer Service<br/>apps/ingest/src/consumers]
    end

    subgraph Analytical Storage & UI
        D -->|Vectorized Inserts| E[(DuckDB Columnar Store)]
        E -->|Fast SQL Queries| F[Next.js Log Viewer UI<br/>apps/web/]
    end
```

---

## 🌟 Key Features

1. **Lightweight Go Collector Agent (`apps/agent/`)**:
   - Compiles to a single zero-dependency static binary.
   - Circular ring buffer memory management prevents GC pauses.
   - Inode-aware file tailing and automatic log rotation handling.
2. **Dual-Mode Resilient Ingest Engine (`apps/ingest/`)**:
   - Production mode: Kafka distributed consumer group with automatic rebalancing and partition offset management.
   - Development mode: Zero-config in-memory batch buffer for local offline testing.
3. **Embedded Vectorized Analytics (`storage/`)**:
   - Powered by DuckDB columnar engine for sub-100ms SQL aggregation over millions of rows.
   - Native export to partitioned Parquet files.
4. **Interactive Real-Time Console (`apps/web/`)**:
   - Next.js 15 dashboard with live tailing, regex filtering, error level faceting, and trace timeline visualization.

---

## 🚀 Quick Start

### 1. Run the Entire Monorepo

```bash
# Install dependencies
pnpm install

# Start Ingestion Service and Web Console simultaneously
pnpm dev
```

### Authenticated ingestion and console access

- Configure `TELEMETRY_DATABASE_URL` and `DEVLAB_LOGS_API_KEY` in
  `apps/ingest/.env`. Keep the ingestion key server-side; never expose it to the
  browser.
- Configure `DEVLAB_PORTAL_API_URL`, `OIDC_ISSUER`, and
  `DEVLAB_LOGS_CORS_ORIGINS` for Portal SSO and the allowed console origin.
- Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DEVLAB_PORTAL_API_URL`, and
  `NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL` in `apps/web/.env.local`. The console uses
  the authenticated Portal session for log queries and obtains a one-time,
  short-lived ticket for WebSocket connections.
- Set `INGEST_URL`, `SERVICE_NAME`, and `DEVLAB_LOGS_API_KEY` in the collector's
  process environment. `INGEST_URL` must use HTTPS outside local development.
- Set `DEVLAB_LOGS_READ_API_KEY` only for trusted server-side consumers that
  need service-to-service read access, such as IncidentAI. Portal users receive
  tenant-scoped query access.

The API does not permit anonymous ingestion or log reads. Do not put ingestion
or read keys in `NEXT_PUBLIC_*` variables, and rotate any credentials that have
been exposed in local environment files.

### 2. Run the Go Edge Agent

```bash
cd apps/agent
go run ./cmd --dir ./logs
```

Provide `INGEST_URL`, `SERVICE_NAME`, and `DEVLAB_LOGS_API_KEY` through the
process environment or a secret manager before starting the collector.

### 3. Build & Typecheck

```bash
# Typecheck TypeScript packages
pnpm typecheck

# Build all packages via Turborepo
pnpm build
```

---

## 📁 Repository Structure

```
devlab-logs/
├── apps/
│   ├── agent/                  # High-performance Go edge telemetry collection daemon
│   │   ├── cmd/main.go         # Agent CLI entrypoint
│   │   └── producer/buffer.go  # Concurrent circular ring buffer
│   ├── ingest/                 # Node.js / Express high-throughput stream ingestion service
│   │   └── src/
│   │       ├── consumers/      # Dual-mode Kafka consumer group & fallback
│   │       └── routes/         # Ingestion endpoints & batch handlers
│   └── web/                    # Next.js 15 interactive log viewer and search console
├── storage/                    # Database schemas and analytical storage adapters
├── .agents/                    # Specialized AI agent definitions
├── .husky/                     # Pre-commit & commit-msg hooks (gofmt, prettier, commitlint)
├── .vscode/                    # VS Code settings with watcher exclusions & Go format-on-save
├── commitlint.config.ts        # Conventional commits configuration
├── pnpm-workspace.yaml         # Monorepo workspace configuration (apps/*)
└── turbo.json                  # Turborepo task pipeline configuration
```
