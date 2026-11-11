"use client";

import React from "react";
import { Zap, AlertTriangle, Server, Cpu } from "lucide-react";
import { KpiCard } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { Environment, LogLevel } from "../types";

export interface LogKpiCardsProps {
  eps: number;
  errRate: number;
  rateHist: number[];
  errHist: number[];
  env: Environment;
  p95: number;
}

/**
 * Top KPI dashboard metrics summary cards.
 */
export function LogKpiCards({ eps, errRate, rateHist, errHist, env, p95 }: LogKpiCardsProps) {
  const isHighError = errRate > 4;
  const isCritical = errRate > 8;

  const errBadge = isCritical
    ? { label: LogLevel.FATAL, className: "dl-badge--error" }
    : isHighError
      ? { label: LogLevel.WARN, className: "dl-badge--warn" }
      : { label: LogLevel.INFO, className: "dl-badge--info" };

  const collectors =
    env === Environment.DEVELOPMENT ? "3" : env === Environment.STAGING ? "24" : "128";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "0.75rem",
      }}
    >
      <KpiCard
        icon={Zap}
        label={UI_COPY.LOGS.METRICS.THROUGHPUT}
        value={eps.toFixed(1)}
        unit={UI_COPY.LOGS.HEADER.EVENTS_PER_SECOND}
        sparkData={rateHist}
      />
      <KpiCard
        icon={AlertTriangle}
        label={UI_COPY.LOGS.METRICS.ERROR_RATE}
        value={errRate.toFixed(1)}
        unit="%"
        sparkData={errHist}
        badge={errBadge}
        tone={isHighError ? "error" : undefined}
      />
      <KpiCard
        icon={Server}
        label={UI_COPY.LOGS.METRICS.EDGE_COLLECTORS}
        value={collectors}
        unit={UI_COPY.LOGS.METRICS.COLLECTORS_UNIT}
        subtext={UI_COPY.LOGS.METRICS.COLLECTORS_NOTE}
      />
      <KpiCard
        icon={Cpu}
        label={UI_COPY.LOGS.METRICS.P95_QUERY_LATENCY}
        value={`${p95}`}
        unit="ms"
        subtext={UI_COPY.LOGS.METRICS.QUERY_LATENCY_NOTE}
      />
    </div>
  );
}
