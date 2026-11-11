/**
 * @file apps/ingest/src/main.ts
 * @description Main HTTP & WebSocket telemetry server for DevLab Ingestion Gateway.
 * Mounts batch ingestion, live stream tickets, historical search, and AI investigations.
 * @module @devlab/logs-ingest
 */

import { randomUUID } from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";
import { IngestLogEventSchema } from "./types";
import { SqlBatcher } from "./batcher/sql_batcher";
import { OllamaEmbedder } from "./embedder/ollama_embedder";
import { TelemetryKafkaConsumer } from "./consumers/kafka_consumer";
import { TelemetryWsServer } from "./stream/ws_server";
import {
  InvestigationStore,
  InvestigationService,
  createInvestigationRouter,
} from "./investigations";
import { getLogsPrincipal, requireLogIngestKey, requireLogReadAccess } from "./auth";
import { Logger } from "@yuva-devlab/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = parseInt(process.env.PORT || "4003", 10);
const logger = new Logger("LogsIngest");
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "1mb" }));
app.use("/api/v1/logs", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use((req, res, next) => {
  const incoming = req.header("x-request-id");
  const requestId = incoming && /^[A-Za-z0-9._-]{1,128}$/.test(incoming) ? incoming : randomUUID();
  const startedAt = Date.now();
  res.setHeader("x-request-id", requestId);
  res.once("finish", () => {
    logger.info("HTTP request", {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

const allowedOrigins = new Set(
  (process.env.DEVLAB_LOGS_CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.header("origin");
  if (origin && !allowedOrigins.has(origin)) {
    res.sendStatus(403);
    return;
  }
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
    return;
  }
  next();
});

const sqlBatcher = new SqlBatcher();
const embedder = new OllamaEmbedder(sqlBatcher.pool);
const wsServer = new TelemetryWsServer(allowedOrigins);
server.on("upgrade", (req, sock, head) => wsServer.handleUpgrade(req, sock, head));

const investigationStore = new InvestigationStore(sqlBatcher.pool);
const investigationService = new InvestigationService(investigationStore, embedder);
app.use(
  "/api/v1/investigations",
  requireLogReadAccess,
  createInvestigationRouter(investigationService),
);

const kafkaBrokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",").map((b) => b.trim())
  : [];
const kafkaConsumer = new TelemetryKafkaConsumer(
  {
    brokers: kafkaBrokers,
    groupId: process.env.KAFKA_GROUP_ID || "devlab-logs-consumer-group",
    topic: process.env.KAFKA_TOPIC || "devlab.telemetry.logs",
    broadcastFn: (log) => wsServer.broadcast(log),
  },
  sqlBatcher,
  embedder,
);
void kafkaConsumer.start();

// Batch Ingestion endpoint
app.post("/api/v1/logs/batch", requireLogIngestKey, async (req, res) => {
  try {
    const rawBatch = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = IngestLogEventSchema.array().max(500).safeParse(rawBatch);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid log payload", details: parsed.error.issues });
      return;
    }
    const { records, latencyMs } = await sqlBatcher.insertBatch(parsed.data);
    for (const record of records) wsServer.broadcast(record);
    void embedder.processLogs(records);
    res.status(200).json({ success: true, count: records.length, latencyMs });
  } catch (err) {
    logger.error("Batch insertion failed", err instanceof Error ? err.name : "unknown");
    res.status(500).json({ error: "Internal ingestion error" });
  }
});

// Single-use stream ticket generation
app.post("/api/v1/logs/stream-ticket", requireLogReadAccess, (_req, res) => {
  if (wsServer.ticketCount >= 10_000) {
    res.status(503).json({ error: "Live stream capacity is temporarily unavailable." });
    return;
  }
  const ticket = wsServer.createTicket(getLogsPrincipal(res.locals.logsPrincipal));
  res.setHeader("Cache-Control", "no-store");
  res.status(201).json({ ticket, expiresInSeconds: 30 });
});

// Historical paginated logs endpoint
app.get("/api/v1/logs", requireLogReadAccess, async (req, res) => {
  try {
    const principal = getLogsPrincipal(res.locals.logsPrincipal);
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 1000 ||
      !Number.isSafeInteger(offset) ||
      offset < 0
    ) {
      res.status(400).json({ error: "Invalid pagination parameters." });
      return;
    }
    const logs = await sqlBatcher.queryLogs({
      service: typeof req.query.service === "string" ? req.query.service : undefined,
      level: typeof req.query.level === "string" ? req.query.level : undefined,
      traceId: typeof req.query.traceId === "string" ? req.query.traceId : undefined,
      tenantId:
        principal.kind === "user" && !principal.isSuperAdmin
          ? principal.tenantId
          : typeof req.query.tenantId === "string"
            ? req.query.tenantId
            : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      limit,
      offset,
    });
    res.status(200).json({ logs });
  } catch (err) {
    logger.error("Log query failed", err instanceof Error ? err.name : "unknown");
    res.status(500).json({ error: "Internal query error" });
  }
});

// Semantic Log-RAG search endpoint
app.post("/api/v1/logs/rag-search", requireLogReadAccess, async (req, res) => {
  try {
    const principal = getLogsPrincipal(res.locals.logsPrincipal);
    const query = typeof req.body.query === "string" ? req.body.query : "";
    const limit = typeof req.body.limit === "number" ? req.body.limit : 5;
    if (
      !query.trim() ||
      query.length > 2000 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50
    ) {
      res.status(400).json({ error: "Invalid semantic search query or limit." });
      return;
    }
    const tenantId =
      principal.kind === "user" && !principal.isSuperAdmin ? principal.tenantId : undefined;
    const matches = await embedder.searchLogEpisodes(query, limit, tenantId);
    res.status(200).json({ query, matches });
  } catch (err) {
    logger.error("Semantic log search failed", err instanceof Error ? err.name : "unknown");
    res.status(500).json({ error: "Internal RAG search error" });
  }
});

app.get(["/health", "/api/v1/health"], (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "devlab-logs-ingest",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

server.listen(port, () => {
  console.log(`[IngestServer] DevLab Ingest running on http://localhost:${port}`);
});

const shutdown = async () => {
  console.log("[IngestServer] Gracefully shutting down...");
  await kafkaConsumer.stop();
  wsServer.close();
  server.close();
  await sqlBatcher.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
