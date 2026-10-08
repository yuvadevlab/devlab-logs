/**
 * Log-RAG vector embedding service leveraging local Ollama nomic-embed-text.
 * Automatically identifies warning/error episodes and performs HNSW nearest-neighbor queries.
 */

import { Pool } from "pg";
import type { SystemLogRecord, LogEpisodeMatch } from "../types.js";

/**
 * Embedder service encapsulating Ollama interaction and vector database operations.
 */
export class OllamaEmbedder {
  private readonly ollamaUrl: string;
  private readonly model: string;
  private readonly pool: Pool;

  /**
   * Constructs embedder instance.
   *
   * @param pool Shared or dedicated PostgreSQL connection pool
   * @param ollamaUrl Ollama server base URL
   * @param model Embedding model identifier
   */
  constructor(pool: Pool, ollamaUrl?: string, model?: string) {
    this.pool = pool;
    this.ollamaUrl = ollamaUrl || process.env.OLLAMA_URL || "http://localhost:11434";
    this.model = model || process.env.EMBEDDING_MODEL || "nomic-embed-text:latest";
  }

  /**
   * Generates a 768-dimensional dense vector embedding for input text.
   *
   * @param text String payload to embed
   * @returns 768-dimensional float array, or null if generation failed
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });

      if (!response.ok) {
        console.warn(`[OllamaEmbedder] HTTP ${response.status} from Ollama embeddings`);
        return null;
      }

      const data = (await response.json()) as { embedding?: number[] };
      return data.embedding || null;
    } catch (err) {
      console.warn("[OllamaEmbedder] Failed to reach Ollama endpoint:", err);
      return null;
    }
  }

  /**
   * Identifies high-severity error or warning logs and persists vector embeddings.
   *
   * @param logs Persisted system logs from current batch
   */
  async processLogs(logs: SystemLogRecord[]): Promise<void> {
    // Filter only high-severity or failure events for semantic indexing
    const candidateLogs = logs.filter(
      (log) =>
        log.level === "error" ||
        log.level === "warn" ||
        log.message.toLowerCase().includes("error") ||
        log.message.toLowerCase().includes("failed") ||
        log.message.toLowerCase().includes("timeout"),
    );

    if (candidateLogs.length === 0) {
      return;
    }

    for (const log of candidateLogs) {
      const summary = `[${log.service.toUpperCase()}] ${log.level.toUpperCase()}: ${log.message}`;
      const vector = await this.generateEmbedding(summary);

      if (!vector || vector.length === 0) {
        continue;
      }

      const vectorString = `[${vector.join(",")}]`;

      const insertQuery = `
        INSERT INTO log_embeddings (log_id, log_timestamp, service, summary, embedding)
        VALUES ($1, $2, $3, $4, $5::vector)
        ON CONFLICT DO NOTHING;
      `;

      try {
        await this.pool.query(insertQuery, [
          log.id,
          log.timestamp,
          log.service,
          summary,
          vectorString,
        ]);
      } catch (err) {
        console.error("[OllamaEmbedder] Failed to store embedding record:", err);
      }
    }
  }

  /**
   * Performs sub-10ms HNSW approximate nearest neighbor search over historical logs.
   *
   * @param query Natural language inquiry (e.g. "connection timeout on worker")
   * @param limit Top matches to return
   * @returns Ranked log episode matches with cosine similarity scores
   */
  async searchLogEpisodes(query: string, limit: number = 5): Promise<LogEpisodeMatch[]> {
    const queryVector = await this.generateEmbedding(query);
    if (!queryVector) {
      return [];
    }

    const vectorString = `[${queryVector.join(",")}]`;

    const searchQuery = `
      SELECT id, log_id, log_timestamp, service, summary, (1 - (embedding <=> $1::vector)) AS similarity
      FROM log_embeddings
      ORDER BY embedding <=> $1::vector ASC
      LIMIT $2;
    `;

    const res = await this.pool.query<{
      id: string;
      log_id: string;
      log_timestamp: Date;
      service: string;
      summary: string;
      similarity: string | number;
    }>(searchQuery, [vectorString, limit]);

    return res.rows.map((row) => ({
      id: row.id,
      log_id: row.log_id,
      log_timestamp: row.log_timestamp,
      service: row.service,
      summary: row.summary,
      similarity: typeof row.similarity === "string" ? parseFloat(row.similarity) : row.similarity,
    }));
  }
}
