-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Main Partitioned Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT uuid_generate_v4(),
  service VARCHAR(64) NOT NULL,
  level VARCHAR(16) NOT NULL,
  trace_id VARCHAR(64),
  tenant_id VARCHAR(64),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Automated monthly partitions
CREATE TABLE IF NOT EXISTS system_logs_2026_10
PARTITION OF system_logs
FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS system_logs_2026_11
PARTITION OF system_logs
FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS system_logs_default
PARTITION OF system_logs DEFAULT;

-- 2. GIN Index on JSONB Metadata for Sub-Millisecond Filtering
CREATE INDEX IF NOT EXISTS idx_system_logs_meta_gin 
ON system_logs USING GIN (metadata jsonb_path_ops);

-- 3. Composite Index on Service + Timestamp
CREATE INDEX IF NOT EXISTS idx_system_logs_service_time 
ON system_logs (service, timestamp DESC);

-- 4. Index on Trace ID for Fast Correlation Lookups
CREATE INDEX IF NOT EXISTS idx_system_logs_trace_id 
ON system_logs (trace_id);

-- 5. Vector Table for Semantic Log-RAG Search
CREATE TABLE IF NOT EXISTS log_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID NOT NULL,
  log_timestamp TIMESTAMPTZ NOT NULL,
  service VARCHAR(64) NOT NULL,
  summary TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HNSW Vector Index for Sub-10ms Approximate Nearest Neighbor Retrieval
CREATE INDEX IF NOT EXISTS idx_log_embeddings_hnsw 
ON log_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
