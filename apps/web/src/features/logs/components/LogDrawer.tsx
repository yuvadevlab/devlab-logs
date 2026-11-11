"use client";

import React, { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Input,
  Badge,
  JsonTree,
  toast,
} from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS, fmtIso } from "@/lib/logs";
import { UI_COPY } from "@/lib/ui-copy";
import type { LogEvent } from "../types";
import { LogDrawerTraceTab } from "./LogDrawerTraceTab";

export interface LogDrawerProps {
  log: LogEvent | null;
  logs: LogEvent[];
  onClose: () => void;
  onSelect: (log: LogEvent) => void;
}

/**
 * Slide-over drawer providing payload JSON inspection, trace waterfall, and context logs.
 */
export function LogDrawer({ log, logs, onClose, onSelect }: LogDrawerProps) {
  const [keyFilter, setKeyFilter] = useState("");

  const trace = useMemo(
    () => (log ? logs.filter((l) => l.traceId === log.traceId).sort((a, b) => a.ts - b.ts) : []),
    [log, logs],
  );

  const surrounding = useMemo(() => {
    if (!log) return [];
    const idx = logs.findIndex((l) => l.id === log.id);
    return idx < 0 ? [] : logs.slice(Math.max(0, idx - 10), idx + 11);
  }, [log, logs]);

  const copyPayload = () => {
    if (!log) return;
    navigator.clipboard?.writeText(JSON.stringify(log.meta, null, 2)).catch(() => {});
    toast.success(UI_COPY.LOGS.NOTIFICATIONS.PAYLOAD_COPIED);
  };

  return (
    <Sheet open={!!log} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="bg-popover border-l sm:max-w-2xl"
        style={{ width: "100%", overflowY: "auto" }}
      >
        {log && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <SheetHeader
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Badge
                  variant="outline"
                  className={cn("dl-drawer__badge-meta", LEVEL_CLASS[log.level])}
                >
                  {log.level}
                </Badge>
                <Badge variant="secondary" className="dl-drawer__badge-meta">
                  {log.service}
                </Badge>
                <Badge
                  variant="outline"
                  className="dl-drawer__badge-meta"
                  style={{
                    borderColor: "color-mix(in oklab, var(--ai) 40%, transparent)",
                    backgroundColor: "color-mix(in oklab, var(--ai) 10%, transparent)",
                    color: "var(--ai)",
                  }}
                >
                  trace {log.traceId}
                </Badge>
                <Badge variant="outline" className="dl-drawer__badge-meta">
                  {log.latency}ms
                </Badge>
              </div>
              <SheetTitle className="dl-drawer__title-text" style={{ fontWeight: 500 }}>
                {log.message}
              </SheetTitle>
              <SheetDescription className="dl-drawer__subtitle-text">
                {fmtIso(log.ts)} UTC · span {log.spanId}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="json" style={{ marginTop: "1rem" }}>
              <TabsList>
                <TabsTrigger value="json">{UI_COPY.LOGS.DRAWER.PAYLOAD}</TabsTrigger>
                <TabsTrigger value="trace">Trace ({trace.length})</TabsTrigger>
                <TabsTrigger value="around">{UI_COPY.LOGS.DRAWER.SURROUNDING}</TabsTrigger>
              </TabsList>

              <TabsContent
                value="json"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  paddingTop: "0.5rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Input
                    value={keyFilter}
                    onChange={(e) => setKeyFilter(e.target.value)}
                    placeholder={UI_COPY.LOGS.FILTERS.FILTER_KEYS_PLACEHOLDER}
                    className="dl-drawer__action-btn"
                    style={{ height: "2rem" }}
                  />
                  <Button size="sm" variant="outline" onClick={copyPayload}>
                    <Copy className="dl-drawer__action-icon" />
                    {UI_COPY.LOGS.DRAWER.COPY_JSON}
                  </Button>
                </div>
                <div className="panel" style={{ padding: "0.75rem" }}>
                  <JsonTree data={log.meta} filter={keyFilter} />
                </div>
              </TabsContent>

              <TabsContent value="trace">
                <LogDrawerTraceTab trace={trace} log={log} onSelect={onSelect} />
              </TabsContent>

              <TabsContent
                value="around"
                className="panel"
                style={{ overflow: "hidden", paddingTop: 0 }}
              >
                {surrounding.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSelect(l)}
                    className={cn(
                      "hover:bg-accent font-mono text-[11px]",
                      l.id === log.id && "bg-primary/10",
                    )}
                    style={{
                      display: "grid",
                      width: "100%",
                      gridTemplateColumns: "90px 56px 1fr",
                      gap: "0.5rem",
                      borderBottom: "1px solid color-mix(in oklab, var(--border) 40%, transparent)",
                      padding: "0.375rem 0.75rem",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      borderBottomWidth: "1px",
                      cursor: "pointer",
                      color: "inherit",
                    }}
                  >
                    <span style={{ color: "var(--mutedForeground)" }}>
                      {new Date(l.ts).toLocaleTimeString()}
                    </span>
                    <span className={cn("chip justify-center", LEVEL_CLASS[l.level])}>
                      {l.level}
                    </span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {l.service}: {l.message}
                    </span>
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
