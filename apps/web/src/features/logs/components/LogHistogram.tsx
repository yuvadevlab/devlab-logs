"use client";

import React, { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LogLevel, LEVELS, type LogEvent } from "../types";

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
  [LogLevel.DEBUG]: "bg-debug",
  [LogLevel.INFO]: "bg-info",
  [LogLevel.WARN]: "bg-warn",
  [LogLevel.ERROR]: "bg-error",
  [LogLevel.FATAL]: "bg-fatal",
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
    <div className="panel flex flex-col p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Log volume · drag to zoom</span>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          {ORDER.slice()
            .reverse()
            .map((l) => (
              <span key={l} className="flex items-center gap-1">
                <span className={cn("size-2 rounded-sm", FILL[l])} />
                {l}
              </span>
            ))}
          {zoom && (
            <button
              type="button"
              onClick={() => setZoom(null)}
              className="chip lvl-info hover:border-primary cursor-pointer"
            >
              reset zoom ✕
            </button>
          )}
        </div>
      </div>

      <div
        ref={ref}
        className="relative flex h-28 cursor-crosshair items-end gap-px select-none"
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
              className="flex h-full flex-1 flex-col-reverse transition-opacity hover:opacity-80"
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
            className="border-primary bg-primary/15 pointer-events-none absolute inset-y-0 border-x"
            style={{
              left: `${(Math.min(...drag) / BUCKETS) * 100}%`,
              width: `${(Math.abs(drag[1] - drag[0]) / BUCKETS) * 100}%`,
            }}
          />
        )}
      </div>

      <div className="text-muted-foreground mt-1 flex justify-between font-mono text-[10px]">
        <span>{fmt(start)}</span>
        <span>{fmt(start + (end - start) / 2)}</span>
        <span>{fmt(end)}</span>
      </div>
    </div>
  );
}
