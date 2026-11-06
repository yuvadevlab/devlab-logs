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

-- 7. Persistent AI Investigation Conversations
CREATE TABLE IF NOT EXISTS investigation_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64),
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on User ID and Updated At for Fast History Drawer Retrieval
CREATE INDEX IF NOT EXISTS idx_investigation_conversations_user 
ON investigation_conversations (user_id, updated_at DESC);

-- Index on Tenant ID for Multi-Tenant Scoping
CREATE INDEX IF NOT EXISTS idx_investigation_conversations_tenant 
ON investigation_conversations (tenant_id, updated_at DESC);

-- 8. Persistent AI Investigation Messages with Log-RAG Citations
CREATE TABLE IF NOT EXISTS investigation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES investigation_conversations(id) ON DELETE CASCADE,
  role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chronological Index for Conversation Message Turn Hydration
CREATE INDEX IF NOT EXISTS idx_investigation_messages_convo 
ON investigation_messages (conversation_id, created_at ASC);

