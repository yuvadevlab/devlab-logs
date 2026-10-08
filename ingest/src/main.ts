/**
 * Main HTTP and WebSocket ingestion server for DevLab Telemetry.
 * Exposes batch ingestion endpoints, live event streaming, and semantic Log-RAG search.
 */

import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { IngestLogEventSchema } from "./types.js";
import { SqlBatcher } from "./batcher/sql_batcher.js";
import { OllamaEmbedder } from "./embedder/ollama_embedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = parseInt(process.env.PORT || "3020", 10);
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/stream" });

app.use(express.json({ limit: "20mb" }));

// Enable CORS for DevLab Web Studio
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const sqlBatcher = new SqlBatcher();
const embedder = new OllamaEmbedder(sqlBatcher.pool);

// Connected WebSocket clients set
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
  ws.on("error", () => clients.delete(ws));
});

/**
 * Broadcasts a log event payload to all connected browser clients.
 */
function broadcast(log: unknown): void {
  const payload = JSON.stringify(log);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Ingestion endpoint: Receives bulk events from devlab-log-agent
app.post("/api/v1/logs/batch", async (req, res) => {
  try {
    const rawBatch = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = IngestLogEventSchema.array().safeParse(rawBatch);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid log payload", details: parsed.error.issues });
      return;
    }

    const { records, latencyMs } = await sqlBatcher.insertBatch(parsed.data);

    // Broadcast records to live streaming clients
    for (const record of records) {
      broadcast(record);
    }

    // Trigger async vector embedding for error and warning traces
    void embedder.processLogs(records);

    res.status(200).json({ success: true, count: records.length, latencyMs });
  } catch (err) {
    console.error("[IngestServer] Batch insertion error:", err);
    res.status(500).json({ error: "Internal ingestion error" });
  }
});

// Query endpoint: Paginated historical log retrieval
app.get("/api/v1/logs", async (req, res) => {
  try {
    const logs = await sqlBatcher.queryLogs({
      service: typeof req.query.service === "string" ? req.query.service : undefined,
      level: typeof req.query.level === "string" ? req.query.level : undefined,
      traceId: typeof req.query.traceId === "string" ? req.query.traceId : undefined,
      tenantId: typeof req.query.tenantId === "string" ? req.query.tenantId : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 100,
      offset: req.query.offset ? parseInt(String(req.query.offset), 10) : 0,
    });
    res.status(200).json({ logs });
  } catch (err) {
    console.error("[IngestServer] Query error:", err);
    res.status(500).json({ error: "Internal query error" });
  }
});

// Semantic search endpoint: HNSW cosine nearest neighbor retrieval
app.post("/api/v1/logs/rag-search", async (req, res) => {
  try {
    const query = typeof req.body.query === "string" ? req.body.query : "";
    const limit = typeof req.body.limit === "number" ? req.body.limit : 5;

    if (!query) {
      res.status(400).json({ error: "Query string is required" });
      return;
    }

    const matches = await embedder.searchLogEpisodes(query, limit);
    res.status(200).json({ query, matches });
  } catch (err) {
    console.error("[IngestServer] RAG search error:", err);
    res.status(500).json({ error: "Internal RAG search error" });
  }
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

server.listen(port, () => {
  console.log(`[IngestServer] DevLab Ingest Service running on http://localhost:${port}`);
  console.log(`[IngestServer] WebSocket Live Log Stream active on ws://localhost:${port}/stream`);
});

// Graceful termination handling
const shutdown = async () => {
  console.log("[IngestServer] Gracefully shutting down...");
  wss.close();
  server.close();
  await sqlBatcher.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
