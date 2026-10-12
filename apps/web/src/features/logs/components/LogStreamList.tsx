"use client";

import React, { useRef, useEffect } from "react";
import { Clock, Eye, ArrowDownToLine } from "lucide-react";
import type { LogEvent } from "../types";
import { LogRow } from "./LogRow";

export interface LogStreamListProps {
  logs: LogEvent[];
  visibleLogs: LogEvent[];
  now: number;
  isoTime: boolean;
  setIsoTime: (v: boolean | ((p: boolean) => boolean)) => void;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  filterCount: number;
  onClearFilters: () => void;
  query: string;
  regex: RegExp | null;
  expanded: Set<number>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<number>>>;
  onSelectLog: (log: LogEvent) => void;
  onTraceFilter: (traceId: string) => void;
  lastId: number;
}

/**
 * High-performance virtualized/scrollable waterfall telemetry log stream list.
 */
export function LogStreamList({
  logs,
  visibleLogs,
  now,
  isoTime,
  setIsoTime,
  autoScroll,
  setAutoScroll,
  filterCount,
  onClearFilters,
  query,
  regex,
  expanded,
  setExpanded,
  onSelectLog,
  onTraceFilter,
  lastId,
}: LogStreamListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as fresh events stream in
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs.length, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    if (!isAtBottom && autoScroll) setAutoScroll(false);
    else if (isAtBottom && !autoScroll) setAutoScroll(true);
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Stream Table Header */}
      <div className="text-muted-foreground grid grid-cols-[150px_64px_130px_120px_1fr_24px] items-center gap-3 border-b px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase">
        <button
          type="button"
          onClick={() => setIsoTime((v) => !v)}
          className="hover:text-foreground flex cursor-pointer items-center gap-1 text-left"
        >
          <Clock className="size-3" />
          {isoTime ? "ISO UTC" : "Relative"} ⇄
        </button>
        <span>Level</span>
        <span>Service</span>
        <span>Trace</span>
        <span className="flex justify-between">
          Message
          <span className="tracking-normal normal-case">
            {visibleLogs.length.toLocaleString()} events
            {filterCount > 0 && (
              <>
                {" "}
                ·{" "}
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-primary cursor-pointer hover:underline"
                >
                  clear {filterCount} filter{filterCount > 1 ? "s" : ""}
                </button>
              </>
            )}
          </span>
        </span>
        <span />
      </div>

      {/* Stream List Body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto font-mono text-xs"
      >
        {visibleLogs.length === 0 ? (
          <div className="grid h-full place-items-center p-10 text-center">
            <div>
              <Eye className="text-muted-foreground mx-auto mb-3 size-8" />
              <div className="font-sans text-base font-medium">No events match these filters</div>
              <p className="text-muted-foreground mt-1 font-sans text-xs">
                {logs.length
                  ? "Try widening the time range or clearing active filters."
                  : "Buffer is empty — waiting for incoming telemetry events."}
              </p>
            </div>
          </div>
        ) : (
          visibleLogs.map((l) => (
            <LogRow
              key={l.id}
              log={l}
              now={now}
              iso={isoTime}
              isNew={l.id > lastId - 3}
              query={query}
              regex={regex}
              open={expanded.has(l.id)}
              onToggle={() => toggleExpand(l.id)}
              onTrace={() => onTraceFilter(l.traceId)}
              onInspect={() => onSelectLog(l)}
            />
          ))
        )}
      </div>

      {/* Floating Jump-to-Live Pill */}
      {!autoScroll && (
        <button
          type="button"
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
          className="bg-primary text-primary-foreground glow mx-auto -mt-12 mb-3 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-lg"
        >
          <ArrowDownToLine className="size-3.5" /> Jump to live
        </button>
      )}
    </section>
  );
}
