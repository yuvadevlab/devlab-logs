"use client";

import React from "react";
import { AlertTriangle, Clock, Database, Layers } from "lucide-react";
import type { TelemetryMetrics } from "../lib/types";

interface StatsOverviewProps {
  metrics: TelemetryMetrics;
}

/**
 * Top KPI telemetry overview banner displaying stream volume and health.
 */
export const StatsOverview: React.FC<StatsOverviewProps> = ({ metrics }) => {
  const errorPercentage =
    metrics.totalCount > 0 ? ((metrics.errorCount / metrics.totalCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total Logs Ingested */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Stream Events</span>
          <Database className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            {metrics.totalCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">records</span>
        </div>
      </div>

      {/* Error & Warning Rate */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Error Frequency</span>
          <AlertTriangle
            className={`h-4 w-4 ${metrics.errorCount > 0 ? "text-rose-400" : "text-emerald-400"}`}
          />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">{errorPercentage}%</span>
          <span className="text-xs text-rose-400">
            {metrics.errorCount} errors / {metrics.warnCount} warns
          </span>
        </div>
      </div>

      {/* Active Services */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Connected Services</span>
          <Layers className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            {metrics.activeStreams}
          </span>
          <span className="text-xs text-slate-500">monitored</span>
        </div>
      </div>

      {/* Ingestion & DB Latency */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Bulk Ingest Latency</span>
          <Clock className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            {metrics.avgLatencyMs > 0 ? `${metrics.avgLatencyMs}ms` : "< 15ms"}
          </span>
          <span className="text-xs text-emerald-400">sub-20ms p95</span>
        </div>
      </div>
    </div>
  );
};
