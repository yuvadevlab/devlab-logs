"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LogLevel, LEVELS, type LogEvent } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

export interface LogHistogramProps {
  logs: LogEvent[];
  window: [number, number];
  now: number;
  zoom: [number, number] | null;
  setZoom: (zoom: [number, number] | null) => void;
}

const BUCKETS = 60;
const ORDER: readonly LogLevel[] = [
  LogLevel.DEBUG,
  LogLevel.INFO,
  LogLevel.WARN,
  LogLevel.ERROR,
  LogLevel.FATAL,
] as const;

const FILL: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "dl-histogram__bar--debug",
  [LogLevel.INFO]: "dl-histogram__bar--info",
  [LogLevel.WARN]: "dl-histogram__bar--warn",
  [LogLevel.ERROR]: "dl-histogram__bar--error",
  [LogLevel.FATAL]: "dl-histogram__bar--fatal",
};

/**
 * Multi-severity volume histogram with drag-to-zoom interactive time windows.
 */
export function LogHistogram({
  logs,
  window: [start, endRaw],
  now,
  zoom,
  setZoom,
}: LogHistogramProps) {
  const end = Number.isFinite(endRaw) ? endRaw : now;
  const size = Math.max(1, (end - start) / BUCKETS);

  const buckets = useMemo(() => {
    const b = Array.from(
      { length: BUCKETS },
      () =>
        ({
          [LogLevel.FATAL]: 0,
          [LogLevel.ERROR]: 0,
          [LogLevel.WARN]: 0,
          [LogLevel.INFO]: 0,
          [LogLevel.DEBUG]: 0,
        }) as Record<LogLevel, number>,
    );
    logs.forEach((l) => {
      const i = Math.floor((l.ts - start) / size);
      if (i >= 0 && i < BUCKETS) b[i][l.level]++;
    });
    return b;
  }, [logs, start, size]);

  const max = Math.max(1, ...buckets.map((b) => LEVELS.reduce((acc, k) => acc + b[k], 0)));
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<[number, number] | null>(null);

  const toIdx = (x: number) => {
    if (!ref.current) return 0;
    const r = ref.current.getBoundingClientRect();
    return Math.max(0, Math.min(BUCKETS, ((x - r.left) / r.width) * BUCKETS));
  };

  const fmt = (t: number) =>
    new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", padding: "0.75rem" }}>
      <div
        style={{
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
        }}
      >
        <span style={{ color: "var(--mutedForeground)" }}>{UI_COPY.LOGS.STREAM.LOG_VOLUME}</span>
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="dl-histogram__badge"
        >
          {ORDER.slice()
            .reverse()
            .map((l) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span
                  className={cn("dl-histogram__legend-dot", FILL[l])}
                  style={{ display: "inline-block" }}
                />
                {l}
              </span>
            ))}
          {zoom && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(null)}
              className="dl-histogram__badge"
              style={{
                height: "1.25rem",
                padding: "0 0.375rem",
                borderColor: "color-mix(in oklab, var(--primary) 40%, transparent)",
                backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
                color: "var(--primary)",
              }}
            >
              reset zoom ✕
            </Button>
          )}
        </div>
      </div>

      <div
        ref={ref}
        style={{
          position: "relative",
          display: "flex",
          height: "7rem",
          cursor: "crosshair",
          alignItems: "flex-end",
          gap: "1px",
          userSelect: "none",
        }}
        onMouseDown={(e) => {
          const i = toIdx(e.clientX);
          setDrag([i, i]);
        }}
        onMouseMove={(e) => drag && setDrag([drag[0], toIdx(e.clientX)])}
        onMouseUp={() => {
          if (drag && Math.abs(drag[1] - drag[0]) > 0.8) {
            const [a, b] = [Math.min(...drag), Math.max(...drag)];
            setZoom([start + a * size, start + b * size]);
          }
          setDrag(null);
        }}
        onMouseLeave={() => setDrag(null)}
      >
        {buckets.map((b, i) => {
          const tot = LEVELS.reduce((acc, k) => acc + b[k], 0);
          return (
            <div
              key={i}
              title={`${fmt(start + i * size)} · ${tot} events`}
              style={{
                display: "flex",
                height: "100%",
                flex: "1 1 0%",
                flexDirection: "column-reverse",
                transition: "opacity 150ms ease",
              }}
              className="hover:opacity-80"
            >
              {ORDER.map((k) =>
                b[k] ? (
                  <div key={k} className={FILL[k]} style={{ height: `${(b[k] / max) * 100}%` }} />
                ) : null,
              )}
            </div>
          );
        })}

        {drag && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              pointerEvents: "none",
              borderLeft: "1px solid var(--primary)",
              borderRight: "1px solid var(--primary)",
              backgroundColor: "color-mix(in oklab, var(--primary) 15%, transparent)",
              left: `${(Math.min(...drag) / BUCKETS) * 100}%`,
              width: `${(Math.abs(drag[1] - drag[0]) / BUCKETS) * 100}%`,
            }}
          />
        )}
      </div>

      <div
        className="dl-histogram__badge"
        style={{
          marginTop: "0.25rem",
          display: "flex",
          justifyContent: "space-between",
          color: "var(--mutedForeground)",
        }}
      >
        <span>{fmt(start)}</span>
        <span>{fmt(start + (end - start) / 2)}</span>
        <span>{fmt(end)}</span>
      </div>
    </div>
  );
}
