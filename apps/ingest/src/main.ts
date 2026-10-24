/**
 * Main HTTP and WebSocket ingestion server for DevLab Telemetry.
 * Exposes batch ingestion endpoints, live event streaming, and semantic Log-RAG search.
 */

import { randomBytes, randomUUID } from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { IngestLogEventSchema } from "./types";
import { SqlBatcher } from "./batcher/sql_batcher";
import { OllamaEmbedder } from "./embedder/ollama_embedder";
import { TelemetryKafkaConsumer } from "./consumers/kafka_consumer";
import { getLogsPrincipal, requireLogIngestKey, requireLogReadAccess } from "./auth";
import { Logger } from "@yuva-devlab/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = parseInt(process.env.PORT || "4003", 10);
const logger = new Logger("LogsIngest");
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(express.json({ limit: "1mb" }));
app.use("/api/v1/logs", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use((req, res, next) => {
  const incomingRequestId = req.header("x-request-id");
  const requestId =
    incomingRequestId && /^[A-Za-z0-9._-]{1,128}$/.test(incomingRequestId)
      ? incomingRequestId
      : randomUUID();
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
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
    return;
  }
  next();
});

const sqlBatcher = new SqlBatcher();
const embedder = new OllamaEmbedder(sqlBatcher.pool);

const streamTickets = new Map<
  string,
  { principal: ReturnType<typeof getLogsPrincipal>; expiresAt: number }
>();
const streamClients = new Map<WebSocket, ReturnType<typeof getLogsPrincipal>>();

setInterval(() => {
  const now = Date.now();
  for (const [ticket, data] of streamTickets) {
    if (data.expiresAt <= now) streamTickets.delete(ticket);
  }
}, 30_000).unref();

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const origin = request.headers.origin;
  if (url.pathname !== "/stream" || !origin || !allowedOrigins.has(origin)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  const ticket = url.searchParams.get("ticket");
  const ticketData = ticket ? streamTickets.get(ticket) : undefined;
  if (!ticket || !ticketData || ticketData.expiresAt <= Date.now()) {
    if (ticket) streamTickets.delete(ticket);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  streamTickets.delete(ticket);
  wss.handleUpgrade(request, socket, head, (ws) => {
    streamClients.set(ws, ticketData.principal);
    ws.on("close", () => streamClients.delete(ws));
    ws.on("error", () => streamClients.delete(ws));
  });
});

/**
 * Broadcasts a log event payload to all connected browser clients.
 */
function broadcast(log: unknown): void {
  if (
    !log ||
    typeof log !== "object" ||
    !("tenant_id" in log) ||
    (log.tenant_id !== null && typeof log.tenant_id !== "string")
  ) {
    return;
  }
  const payload = JSON.stringify(log);
  for (const [client, principal] of streamClients) {
    const canRead =
      principal.kind === "service" ||
      principal.isSuperAdmin ||
      (!!principal.tenantId && log.tenant_id === principal.tenantId);
    if (client.readyState === WebSocket.OPEN && canRead) {
      client.send(payload);
    }
  }
}

// Kafka Consumer Initialization
const kafkaBrokers = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",").map((b) => b.trim())
  : [];
const kafkaConsumer = new TelemetryKafkaConsumer(
  {
    brokers: kafkaBrokers,
    groupId: process.env.KAFKA_GROUP_ID || "devlab-logs-consumer-group",
    topic: process.env.KAFKA_TOPIC || "devlab.telemetry.logs",
    broadcastFn: broadcast,
  },
  sqlBatcher,
  embedder,
);
void kafkaConsumer.start();

// Ingestion endpoint: Receives bulk events from devlab-log-agent
app.post("/api/v1/logs/batch", requireLogIngestKey, async (req, res) => {
  try {
    const rawBatch = Array.isArray(req.body) ? req.body : [req.body];
    const parsed = IngestLogEventSchema.array().max(500).safeParse(rawBatch);

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
    logger.error("Batch insertion failed", err instanceof Error ? err.name : "unknown");
    res.status(500).json({ error: "Internal ingestion error" });
  }
});

app.post("/api/v1/logs/stream-ticket", requireLogReadAccess, (_req, res) => {
  const now = Date.now();
  for (const [ticket, data] of streamTickets) {
    if (data.expiresAt <= now) streamTickets.delete(ticket);
  }
  if (streamTickets.size >= 10_000) {
    res.status(503).json({ error: "Live stream capacity is temporarily unavailable." });
    return;
  }

  const ticket = randomBytes(32).toString("base64url");
  streamTickets.set(ticket, {
    principal: getLogsPrincipal(res.locals.logsPrincipal),
    expiresAt: now + 30_000,
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(201).json({ ticket, expiresInSeconds: 30 });
});

// Query endpoint: Paginated historical log retrieval
app.get("/api/v1/logs", requireLogReadAccess, async (req, res) => {
  try {
    const principal = getLogsPrincipal(res.locals.logsPrincipal);
    const requestedLimit = req.query.limit ? Number(req.query.limit) : 100;
    const requestedOffset = req.query.offset ? Number(req.query.offset) : 0;
    if (
      !Number.isSafeInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > 1000 ||
      !Number.isSafeInteger(requestedOffset) ||
      requestedOffset < 0
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
      limit: requestedLimit,
      offset: requestedOffset,
    });
    res.status(200).json({ logs });
  } catch (err) {
    logger.error("Log query failed", err instanceof Error ? err.name : "unknown");
    res.status(500).json({ error: "Internal query error" });
  }
});

// Semantic search endpoint: HNSW cosine nearest neighbor retrieval
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
  await kafkaConsumer.stop();
  wss.close();
  server.close();
  await sqlBatcher.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
