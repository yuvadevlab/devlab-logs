/**
 * @file apps/web/src/features/logs/components/facet-utils.ts
 * @description Computes frequency distributions for services, severity levels, and traces.
 * @module @devlab/logs-web/features/logs/components/facet-utils
 */

import { LogLevel, type LogEvent } from "../types";

export interface FacetDistributions {
  sortedServices: [string, number][];
  levelCounts: Record<LogLevel, number>;
  tracesCount: number;
}

/**
 * Computes frequency counts and correlated traces from telemetry log events.
 *
 * @param logs - Array of raw telemetry log events.
 * @returns Sorted services, level breakdown, and unique trace counts.
 */
export function computeFacetDistributions(logs: LogEvent[]): FacetDistributions {
  const serviceMap = new Map<string, number>();
  const levelCounts: Record<LogLevel, number> = {
    [LogLevel.FATAL]: 0,
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 0,
    [LogLevel.INFO]: 0,
    [LogLevel.DEBUG]: 0,
  };
  const traceIds = new Set<string>();

  for (const log of logs) {
    serviceMap.set(log.service, (serviceMap.get(log.service) ?? 0) + 1);
    if (levelCounts[log.level] !== undefined) {
      levelCounts[log.level]++;
    }
    if (log.traceId) {
      traceIds.add(log.traceId);
    }
  }

  const sortedServices = Array.from(serviceMap.entries()).sort((a, b) => b[1] - a[1]);
  return { sortedServices, levelCounts, tracesCount: traceIds.size };
}
