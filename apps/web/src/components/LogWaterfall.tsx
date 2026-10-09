"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Copy, Terminal } from "lucide-react";
import type { TelemetryLog } from "../lib/types";
import { LEVEL_COLORS, SERVICE_COLORS } from "../lib/constants";

interface LogWaterfallProps {
  logs: TelemetryLog[];
  isAutoScroll: boolean;
}

/**
 * Multi-stream waterfall viewer with live auto-scroll and interactive trace drawers.
 */
export const LogWaterfall: React.FC<LogWaterfallProps> = ({ logs, isAutoScroll }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive and auto-scroll mode is active
  useEffect(() => {
    if (isAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isAutoScroll]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-[560px] flex-col rounded-xl border border-slate-800 bg-slate-950/90 font-mono text-xs shadow-2xl backdrop-blur-md">
      {/* Waterfall Stream Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/60 text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Live Waterfall Stream</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            {logs.length} events
          </span>
        </div>
        <span className="text-[11px] text-slate-500">UTC Time • Realtime Ingestion</span>
      </div>

      {/* Waterfall Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <Terminal className="h-8 w-8 text-slate-700" />
            <p className="text-sm font-sans">Awaiting telemetry logs from agent or worker...</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            const sColors = SERVICE_COLORS[log.service] || {
              bg: "bg-slate-800",
              text: "text-slate-300",
              border: "border-slate-700",
            };
            const lColors = LEVEL_COLORS[log.level] || LEVEL_COLORS["info"]!;

            return (
              <div
                key={log.id}
                className="group rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-900/50 transition-colors"
              >
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex cursor-pointer items-start gap-2.5 px-3 py-1.5"
                >
                  <button className="mt-0.5 text-slate-600 group-hover:text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Timestamp */}
                  <span className="shrink-0 text-slate-500 select-none">
                    {new Date(log.timestamp).toISOString().substring(11, 23)}
                  </span>

                  {/* Level Badge */}
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${lColors.bg} ${lColors.text}`}
                  >
                    {log.level}
                  </span>

                  {/* Service Badge */}
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${sColors.bg} ${sColors.text} ${sColors.border}`}
                  >
                    {log.service}
                  </span>

                  {/* Trace ID indicator if available */}
                  {log.trace_id && (
                    <span className="hidden shrink-0 rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline-block">
                      {log.trace_id.substring(0, 10)}…
                    </span>
                  )}

                  {/* Main Log Message */}
                  <span className="flex-1 break-all text-slate-200">{log.message}</span>
                </div>

                {/* Expanded Trace Drawer */}
                {isExpanded && (
                  <div className="mx-3 mb-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-slate-300">
                    <div className="grid grid-cols-2 gap-2 text-slate-400 sm:grid-cols-4">
                      <div>
                        <span className="text-slate-600 block text-[10px]">LOG ID</span>
                        <span className="text-slate-200 select-all">{log.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">TRACE ID</span>
                        <span className="text-slate-200 select-all">{log.trace_id || "None"}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">TENANT ID</span>
                        <span className="text-slate-200 select-all">{log.tenant_id || "None"}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[10px]">TIMESTAMP</span>
                        <span className="text-slate-200">{log.timestamp}</span>
                      </div>
                    </div>

                    {/* Metadata JSON Viewer */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-3">
                        <span className="text-slate-500 block text-[10px] font-semibold uppercase mb-1">
                          Metadata JSON
                        </span>
                        <pre className="overflow-x-auto rounded border border-slate-800/80 bg-slate-900/80 p-2 text-indigo-300">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
