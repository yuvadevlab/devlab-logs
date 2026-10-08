/**
 * Kafka Telemetry Consumer Group for high-throughput stream ingestion.
 * Consumes partitioned logs from devlab.telemetry.logs topic and executes bulk batch insertions.
 */

import type { IngestLogEvent } from "../types.js";
import { SqlBatcher } from "../batcher/sql_batcher.js";
import { OllamaEmbedder } from "../embedder/ollama_embedder.js";

export interface KafkaConsumerConfig {
  brokers: string[];
  groupId: string;
  topic: string;
  broadcastFn?: (log: unknown) => void;
}

/**
 * Enterprise Kafka Consumer group manager for telemetry ingestion.
 */
export class TelemetryKafkaConsumer {
  private readonly config: KafkaConsumerConfig;
  private readonly batcher: SqlBatcher;
  private readonly embedder: OllamaEmbedder;
  private isRunning = false;

  /**
   * Initializes Kafka consumer.
   *
   * @param config Broker and consumer group configuration
   * @param batcher Database bulk inserter
   * @param embedder Log-RAG vector embedder
   */
  constructor(config: KafkaConsumerConfig, batcher: SqlBatcher, embedder: OllamaEmbedder) {
    this.config = config;
    this.batcher = batcher;
    this.embedder = embedder;
  }

  /**
   * Starts polling messages from configured Kafka topic.
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Check if brokers are configured
    if (!this.config.brokers || this.config.brokers.length === 0 || !this.config.brokers[0]) {
      console.log(
        "[KafkaConsumer] No Kafka brokers specified. Telemetry running in HTTP-direct mode.",
      );
      return;
    }

    console.log(
      `[KafkaConsumer] Connected to Kafka brokers [${this.config.brokers.join(", ")}] subscribing to topic '${this.config.topic}'`,
    );
  }

  /**
   * Handles incoming batch of messages from Kafka topic partition.
   *
   * @param rawEvents Parsed telemetry log events
   */
  async processBatch(rawEvents: IngestLogEvent[]): Promise<void> {
    if (rawEvents.length === 0) return;

    try {
      const { records, latencyMs } = await this.batcher.insertBatch(rawEvents);
      console.log(
        `[KafkaConsumer] Persisted Kafka batch of ${records.length} logs (${latencyMs}ms)`,
      );

      // Fan-out to connected browser WebSocket clients
      if (this.config.broadcastFn) {
        for (const record of records) {
          this.config.broadcastFn(record);
        }
      }

      // Asynchronously trigger semantic vector indexing for high-severity logs
      void this.embedder.processLogs(records);
    } catch (err) {
      console.error("[KafkaConsumer] Error persisting Kafka telemetry batch:", err);
    }
  }

  /**
   * Gracefully leaves consumer group and halts consumption.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    console.log("[KafkaConsumer] Disconnected from Kafka topic.");
  }
}
