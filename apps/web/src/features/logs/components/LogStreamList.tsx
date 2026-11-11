"use client";

import React, { useRef, useEffect } from "react";
import { Clock, Eye, ArrowDownToLine } from "lucide-react";
import { EmptyState } from "@devlab-logs/ui";
import type { LogEvent } from "../types";
import { LogRow } from "./LogRow";
import { UI_COPY } from "@/lib/ui-copy";

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
  selectedIndex?: number;
  onRowClick?: (idx: number, log: LogEvent) => void;
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
  selectedIndex = -1,
  onRowClick,
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
    <section
      className="panel"
      style={{
        display: "flex",
        minHeight: 0,
        flex: "1 1 0%",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Stream Table Header */}
      <div className="dl-stream-header">
        <button
          type="button"
          onClick={() => setIsoTime((v) => !v)}
          className="hover:text-foreground"
          style={{
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            gap: "0.25rem",
            textAlign: "left",
            background: "none",
            border: "none",
            padding: 0,
            color: "inherit",
            font: "inherit",
          }}
        >
          <Clock className="dl-stream__status-icon" />
          {isoTime ? UI_COPY.LOGS.STREAM.ISO_UTC : UI_COPY.LOGS.STREAM.RELATIVE} ⇄
        </button>
        <span>{UI_COPY.LOGS.STREAM.LEVEL}</span>
        <span>{UI_COPY.LOGS.STREAM.SERVICE}</span>
        <span>{UI_COPY.LOGS.STREAM.TRACE}</span>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          {UI_COPY.LOGS.STREAM.MESSAGE}
          <span style={{ letterSpacing: "normal", textTransform: "none" }}>
            {visibleLogs.length.toLocaleString()} {UI_COPY.LOGS.STREAM.EVENTS}
            {filterCount > 0 && (
              <>
                {" "}
                ·{" "}
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="hover:underline"
                  style={{
                    color: "var(--primary)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  {UI_COPY.LOGS.STREAM.CLEAR_FILTERS(filterCount)}
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
        className="dl-stream__jump-btn"
        style={{ minHeight: 0, flex: "1 1 0%", overflowY: "auto" }}
      >
        {visibleLogs.length === 0 ? (
          <div
            style={{
              display: "grid",
              height: "100%",
              placeItems: "center",
              padding: "2.5rem",
            }}
          >
            <EmptyState
              icon={<Eye className="dl-stream__empty-icon" />}
              title={UI_COPY.LOGS.STREAM.EMPTY_TITLE}
              description={
                logs.length ? UI_COPY.LOGS.STREAM.EMPTY_FILTERS : UI_COPY.LOGS.STREAM.EMPTY_BUFFER
              }
              className="dl-stream__empty-box"
            />
          </div>
        ) : (
          visibleLogs.map((l, idx) => (
            <div key={l.id} onClick={() => onRowClick?.(idx, l)}>
              <LogRow
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
                isSelected={selectedIndex === idx}
              />
            </div>
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
          className="glow"
          style={{
            margin: "-3rem auto 0.75rem",
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            gap: "0.375rem",
            borderRadius: "9999px",
            padding: "0.25rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            backgroundColor: "var(--primary)",
            color: "var(--primaryForeground)",
            border: "none",
            boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.5))",
          }}
        >
          <ArrowDownToLine className="dl-stream__jump-icon" /> {UI_COPY.LOGS.STREAM.JUMP_TO_LIVE}
        </button>
      )}
    </section>
  );
}
