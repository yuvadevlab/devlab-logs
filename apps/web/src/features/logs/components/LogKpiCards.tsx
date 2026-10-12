"use client";

import React from "react";
import { Zap, AlertTriangle, Server, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Environment, LogLevel } from "../types";

export interface LogKpiCardsProps {
  eps: number;
  errRate: number;
  rateHist: number[];
  errHist: number[];
  env: Environment;
  p95: number;
}

function Spark({ data, isErrorTone }: { data: number[]; isErrorTone?: boolean }) {
  const max = Math.max(1, ...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - (v / max) * 26}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={cn("h-8 w-full", isErrorTone ? "text-error" : "text-primary")}
    >
      <polyline points={`0,30 ${pts} 100,30`} className="fill-current opacity-10" />
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  unit,
  spark,
  sub,
  badge,
  isErrorTone,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  unit: string;
  spark?: number[];
  sub?: string;
  badge?: { label: string; class: string };
  isErrorTone?: boolean;
}) {
  return (
    <div className="panel flex flex-col justify-between p-3">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {label}
        </span>
        {badge && <span className={cn("chip", badge.class)}>{badge.label}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={cn(
            "font-mono text-2xl font-semibold tabular-nums",
            isErrorTone && "text-error",
          )}
        >
          {value}
        </span>
        <span className="text-muted-foreground text-xs">{unit}</span>
      </div>
      {spark ? (
        <Spark data={spark} isErrorTone={isErrorTone} />
      ) : (
        <div className="text-muted-foreground font-mono text-[11px]">{sub}</div>
      )}
    </div>
  );
}

/**
 * Top KPI dashboard metrics summary cards.
 */
export function LogKpiCards({ eps, errRate, rateHist, errHist, env, p95 }: LogKpiCardsProps) {
  const isHighError = errRate > 4;
  const isCritical = errRate > 8;

  const errBadge = isCritical
    ? { label: LogLevel.FATAL, class: "lvl-error" }
    : isHighError
      ? { label: LogLevel.WARN, class: "lvl-warn" }
      : { label: LogLevel.INFO, class: "lvl-info" };

  const collectors =
    env === Environment.DEVELOPMENT ? "3" : env === Environment.STAGING ? "24" : "128";

  return (
    <div className="grid grid-cols-2 gap-3">
      <Kpi icon={Zap} label="Throughput" value={eps.toFixed(1)} unit="ev/s" spark={rateHist} />
      <Kpi
        icon={AlertTriangle}
        label="Error rate"
        value={errRate.toFixed(1)}
        unit="%"
        spark={errHist}
        badge={errBadge}
        isErrorTone={isHighError}
      />
      <Kpi
        icon={Server}
        label="Edge collectors"
        value={collectors}
        unit="go agents"
        sub="Kafka broker connected"
      />
      <Kpi
        icon={Cpu}
        label="p95 query latency"
        value={`${p95}`}
        unit="ms"
        sub="duckdb vectorized"
      />
    </div>
  );
}
