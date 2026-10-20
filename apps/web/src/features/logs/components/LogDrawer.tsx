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
  JsonTree,
  toast,
} from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS, fmtIso } from "@/lib/logs";
import { UI_COPY } from "@/lib/ui-copy";
import type { LogEvent } from "../types";

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

  const copyPayload = () => {
    if (!log) return;
    navigator.clipboard?.writeText(JSON.stringify(log.meta, null, 2)).catch(() => {});
    toast.success(UI_COPY.LOGS.NOTIFICATIONS.PAYLOAD_COPIED);
  };

  return (
    <Sheet open={!!log} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="bg-popover w-full overflow-y-auto border-l sm:max-w-2xl"
      >
        {log && (
          <div className="space-y-4">
            <SheetHeader className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("chip", LEVEL_CLASS[log.level])}>{log.level}</span>
                <span className="chip">{log.service}</span>
                <span className="chip text-ai">trace {log.traceId}</span>
                <span className="chip">{log.latency}ms</span>
              </div>
              <SheetTitle className="font-mono text-sm leading-relaxed font-medium">
                {log.message}
              </SheetTitle>
              <SheetDescription className="font-mono text-xs">
                {fmtIso(log.ts)} UTC · span {log.spanId}
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="json" className="mt-4">
              <TabsList>
                <TabsTrigger value="json">{UI_COPY.LOGS.DRAWER.PAYLOAD}</TabsTrigger>
                <TabsTrigger value="trace">Trace ({trace.length})</TabsTrigger>
                <TabsTrigger value="around">{UI_COPY.LOGS.DRAWER.SURROUNDING}</TabsTrigger>
              </TabsList>

              <TabsContent value="json" className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <Input
                    value={keyFilter}
                    onChange={(e) => setKeyFilter(e.target.value)}
                    placeholder={UI_COPY.LOGS.FILTERS.FILTER_KEYS_PLACEHOLDER}
                    className="h-8 font-mono text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={copyPayload}>
                    <Copy className="mr-1 size-3.5" />
                    {UI_COPY.LOGS.DRAWER.COPY_JSON}
                  </Button>
                </div>
                <div className="panel p-3">
                  <JsonTree data={log.meta} filter={keyFilter} />
                </div>
              </TabsContent>

              <TabsContent value="trace" className="pt-2">
                {spans.map((s, idx) => (
                  <div key={idx} className="panel space-y-1 p-3">
                    <div className="text-muted-foreground mb-2 flex justify-between font-mono text-[10px]">
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
                          "hover:bg-accent grid w-full grid-cols-[150px_1fr] items-center gap-2 rounded px-1 py-0.5 text-left",
                          l.id === log.id && "bg-accent",
                        )}
                      >
                        <span
                          className="truncate font-mono text-[11px]"
                          style={{ paddingLeft: depth * 10 }}
                        >
                          {depth ? "└ " : ""}
                          {l.service}
                        </span>
                        <span className="relative h-4">
                          <span
                            className={cn(
                              "absolute top-0.5 h-3 rounded-sm border",
                              LEVEL_CLASS[l.level],
                            )}
                            style={{
                              left: `${(start / s.total) * 100}%`,
                              width: `${Math.max(1, (dur / s.total) * 100)}%`,
                            }}
                          />
                          <span
                            className="text-muted-foreground absolute top-0 font-mono text-[10px]"
                            style={{
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
              </TabsContent>

              <TabsContent value="around" className="panel overflow-hidden pt-0">
                {surrounding.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSelect(l)}
                    className={cn(
                      "border-border/40 hover:bg-accent grid w-full grid-cols-[90px_56px_1fr] gap-2 border-b px-3 py-1.5 text-left font-mono text-[11px]",
                      l.id === log.id && "bg-primary/10",
                    )}
                  >
                    <span className="text-muted-foreground">
                      {new Date(l.ts).toLocaleTimeString()}
                    </span>
                    <span className={cn("chip justify-center", LEVEL_CLASS[l.level])}>
                      {l.level}
                    </span>
                    <span className="truncate">
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
