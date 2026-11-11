/**
 * @file apps/web/src/features/logs/components/LogDrawerTraceTab.tsx
 * @description Distributed trace waterfall visualization for selected telemetry log.
 * @module @devlab/logs-web/features/logs/components/LogDrawerTraceTab
 */

"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS } from "@/lib/logs";
import type { LogEvent } from "../types";

export interface LogDrawerTraceTabProps {
  trace: LogEvent[];
  log: LogEvent;
  onSelect: (log: LogEvent) => void;
}

export function LogDrawerTraceTab({
  trace,
  log,
  onSelect,
}: LogDrawerTraceTabProps): React.JSX.Element {
  const spans = useMemo(() => {
    if (!trace.length) return [];
    const t0 = trace[0].ts - 4;
    const ends = trace.map((l) => l.ts - t0 + l.latency);
    const total = Math.max(...ends) + 4;
    const depthOf = new Map<string, number>();
    const rows = trace.map((l) => {
      const d =
        l.parentSpanId && depthOf.has(l.parentSpanId)
          ? depthOf.get(l.parentSpanId)! + 1
          : l.parentSpanId
            ? 1
            : 0;
      depthOf.set(l.spanId, d);
      return { l, start: l.ts - t0, dur: l.latency, depth: Math.min(d, 5) };
    });
    return [{ total, rows }];
  }, [trace]);

  return (
    <div style={{ paddingTop: "0.5rem" }}>
      {spans.map((s, idx) => (
        <div
          key={idx}
          className="panel"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            padding: "0.75rem",
          }}
        >
          <div
            className="dl-drawer__trace-cell"
            style={{
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              color: "var(--mutedForeground)",
            }}
          >
            <span>0ms</span>
            <span>{Math.round(s.total / 2)}ms</span>
            <span>{Math.round(s.total)}ms</span>
          </div>
          {s.rows.map(({ l, start, dur, depth }) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelect(l)}
              className={cn(
                "dl-drawer__trace-row",
                l.id === log.id && "dl-drawer__trace-row--active",
              )}
              style={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: "150px 1fr",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "0.25rem",
                padding: "0.125rem 0.25rem",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <span
                className="dl-drawer__trace-cell--md"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingLeft: depth * 10,
                }}
              >
                {depth ? "└ " : ""}
                {l.service}
              </span>
              <span style={{ position: "relative", height: "1rem" }}>
                <span
                  className={cn("dl-drawer__trace-bar", LEVEL_CLASS[l.level])}
                  style={{
                    position: "absolute",
                    top: "0.125rem",
                    height: "0.75rem",
                    borderRadius: "0.125rem",
                    left: `${(start / s.total) * 100}%`,
                    width: `${Math.max(1, (dur / s.total) * 100)}%`,
                  }}
                />
                <span
                  className="dl-drawer__trace-cell"
                  style={{
                    position: "absolute",
                    top: 0,
                    color: "var(--mutedForeground)",
                    left: `calc(${Math.min(88, ((start + dur) / s.total) * 100)}% + 4px)`,
                  }}
                >
                  {dur}ms
                </span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
