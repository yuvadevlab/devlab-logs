/**
 * @file apps/ingest/src/batcher/partition_manager.ts
 * @description Automated PostgreSQL range partition provisioning for system_logs.
 * Pre-provisions monthly partitions up to N months in advance.
 * @module @devlab/logs-ingest/partition-manager
 */

import type { Pool } from "pg";
import { Logger } from "@yuva-devlab/logger";

export interface PartitionRange {
  tableName: string;
  startDate: string;
  endDate: string;
}

export class PartitionManager {
  private readonly logger = new Logger("PartitionManager");
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly pool: Pool) {}

  /**
   * Starts periodic partition provisioning (runs immediately and then every 24h).
   */
  start(monthsAhead = 3): void {
    void this.ensurePartitions(monthsAhead);
    // 24-hour interval
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    this.timer = setInterval(() => {
      void this.ensurePartitions(monthsAhead);
    }, TWENTY_FOUR_HOURS);
    this.logger.info("Automated PostgreSQL partition manager started (24h sweep)");
  }

  /**
   * Stops the background interval timer.
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Calculates monthly partition boundaries for current month and next N months.
   */
  calculatePartitions(monthsAhead = 3, fromDate = new Date()): PartitionRange[] {
    const partitions: PartitionRange[] = [];
    const currentYear = fromDate.getUTCFullYear();
    const currentMonth = fromDate.getUTCMonth(); // 0-indexed

    for (let i = 0; i <= monthsAhead; i++) {
      const start = new Date(Date.UTC(currentYear, currentMonth + i, 1, 0, 0, 0));
      const end = new Date(Date.UTC(currentYear, currentMonth + i + 1, 1, 0, 0, 0));

      const yr = start.getUTCFullYear();
      const mo = String(start.getUTCMonth() + 1).padStart(2, "0");
      const tableName = `system_logs_${yr}_${mo}`;

      partitions.push({
        tableName,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    }

    return partitions;
  }

  /**
   * Pre-provisions monthly partitions in PostgreSQL for current month + monthsAhead.
   */
  async ensurePartitions(monthsAhead = 3): Promise<string[]> {
    const partitions = this.calculatePartitions(monthsAhead);
    const provisioned: string[] = [];

    const client = await this.pool.connect().catch((err) => {
      this.logger.warn(`Failed to connect for partition sweep: ${(err as Error).message}`);
      return null;
    });

    if (!client) return [];

    try {
      for (const p of partitions) {
        // Sanitize table name (strict alphanumeric + underscore)
        if (!/^[a-zA-Z0-9_]+$/.test(p.tableName)) {
          this.logger.error(`Invalid partition table name: ${p.tableName}`);
          continue;
        }

        const query = `
          CREATE TABLE IF NOT EXISTS ${p.tableName}
          PARTITION OF system_logs
          FOR VALUES FROM ('${p.startDate}') TO ('${p.endDate}');
        `;

        await client.query(query);
        provisioned.push(p.tableName);
      }
      this.logger.info(
        `Verified ${provisioned.length} system_logs partition(s) (${provisioned.join(", ")})`,
      );
    } catch (err) {
      this.logger.warn(`Partition provisioning sweep error: ${(err as Error).message}`);
    } finally {
      client.release();
    }

    return provisioned;
  }
}
