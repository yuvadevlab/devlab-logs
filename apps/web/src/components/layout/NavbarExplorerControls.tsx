/**
 * @file apps/web/src/components/layout/NavbarExplorerControls.tsx
 * @description Operational stream controls, time-window selectors, and tool triggers for the explorer.
 * Consumes the central ExplorerContext to maintain zero layout shift.
 * @module @devlab/logs-web/components/layout/NavbarExplorerControls
 */

"use client";

import React from "react";
import { Play, Pause, Database, Sparkles, Eraser, ArrowDownToLine } from "lucide-react";
import {
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Switch,
  Separator,
} from "@devlab-logs/ui";
import { useExplorerContext } from "@/features/logs";
import { StreamState, TimeRangeKey, type TimeWindow } from "@/features/logs/types";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

export interface NavbarExplorerControlsProps {
  stream?: StreamState;
  onToggleStream?: () => void;
  eps?: number;
  bufferCount?: number;
  maxBuffer?: number;
  range?: TimeRangeKey;
  setRange?: (r: TimeRangeKey) => void;
  custom?: TimeWindow;
  setCustom?: React.Dispatch<React.SetStateAction<TimeWindow>>;
  autoScroll?: boolean;
  setAutoScroll?: (v: boolean | ((p: boolean) => boolean)) => void;
  onClearLogs?: () => void;
  onOpenSql?: () => void;
  onOpenCopilot?: () => void;
}

const PRESET_RANGES = [
  TimeRangeKey.FIVE_MINUTES,
  TimeRangeKey.FIFTEEN_MINUTES,
  TimeRangeKey.ONE_HOUR,
  TimeRangeKey.TWENTY_FOUR_HOURS,
] as const;

export function NavbarExplorerControls(props?: NavbarExplorerControlsProps) {
  const explorer = useExplorerContext();

  const stream = props?.stream ?? explorer.stream;
  const onToggleStream = props?.onToggleStream ?? explorer.togglePause;
  const eps = props?.eps ?? explorer.eps;
  const bufferCount = props?.bufferCount ?? explorer.bufferCount;
  const maxBuffer = props?.maxBuffer ?? explorer.maxBuffer;
  const range = props?.range ?? explorer.range;
  const setRange = props?.setRange ?? explorer.setRange;
  const custom = props?.custom ?? explorer.custom;
  const setCustom = props?.setCustom ?? explorer.setCustom;
  const autoScroll = props?.autoScroll ?? explorer.autoScroll;
  const setAutoScroll = props?.setAutoScroll ?? explorer.setAutoScroll;
  const onClearLogs = props?.onClearLogs ?? explorer.clearLogs;
  const onOpenSql = props?.onOpenSql ?? (() => explorer.setSqlOpen(true));
  const onOpenCopilot = props?.onOpenCopilot ?? (() => explorer.setCopilotOpen(true));

  const bufferPct = Math.min(100, Math.round((bufferCount / maxBuffer) * 100));

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      {/* Throughput & Buffer Info (Visible on ultra-wide screens to keep laptop header clean) */}
      <div className="text-muted-foreground hidden items-center gap-3 font-mono text-[11px] 2xl:flex">
        <span>
          <span className="text-foreground font-semibold">{eps.toFixed(1)}</span>{" "}
          {UI_COPY.LOGS.HEADER.EPS}
        </span>
        <span className="flex items-center gap-1.5">
          {UI_COPY.LOGS.HEADER.BUFFER_LABEL}
          <span className="bg-muted h-1.5 w-14 overflow-hidden rounded">
            <span
              className="bg-primary block h-full transition-all"
              style={{ width: `${bufferPct}%` }}
            />
          </span>
          <span className="text-foreground">{bufferCount}</span>
        </span>
      </div>

      <div className="border-border/60 bg-muted/30 hidden shrink-0 items-center rounded-md border p-0.5 font-mono text-xs sm:flex">
        {PRESET_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-[11px] transition",
              range === r
                ? "bg-accent text-accent-foreground font-medium shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r}
          </button>
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-[11px] transition",
                range === TimeRangeKey.CUSTOM
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {UI_COPY.LOGS.FILTERS.CUSTOM}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            className="w-72 max-w-[calc(100vw-2rem)] space-y-2 p-3 shadow-xl"
          >
            <div className="text-xs font-medium">{UI_COPY.LOGS.FILTERS.CUSTOM_RANGE}</div>
            <Input
              type="datetime-local"
              value={custom.from}
              onChange={(e) => setCustom((prev) => ({ ...prev, from: e.target.value }))}
              className="font-mono text-xs"
            />
            <Input
              type="datetime-local"
              value={custom.to}
              onChange={(e) => setCustom((prev) => ({ ...prev, to: e.target.value }))}
              className="font-mono text-xs"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!custom.from || !custom.to}
              onClick={() => setRange(TimeRangeKey.CUSTOM)}
            >
              {UI_COPY.LOGS.FILTERS.APPLY_RANGE}
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Auto-Scroll Toggle */}
      <label className="text-muted-foreground hover:text-foreground hidden shrink-0 cursor-pointer items-center gap-1.5 px-1 text-xs lg:flex">
        <ArrowDownToLine className="size-3" />
        <Switch checked={autoScroll} onCheckedChange={setAutoScroll} className="scale-75" />
      </label>

      {/* Stream Play / Pause */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggleStream}
        className="h-7 shrink-0 px-2 text-xs"
        title={
          stream === StreamState.PAUSED
            ? UI_COPY.COMMON.ACTIONS.RESUME_STREAM
            : UI_COPY.COMMON.ACTIONS.PAUSE_STREAM
        }
      >
        {stream === StreamState.PAUSED ? (
          <Play className="size-3.5 text-emerald-500" />
        ) : (
          <Pause className="size-3.5" />
        )}
      </Button>

      {/* Clear Logs */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearLogs}
        className="text-muted-foreground hover:text-foreground h-7 shrink-0 px-1.5 text-xs"
        title={UI_COPY.COMMON.ACTIONS.CLEAR}
      >
        <Eraser className="size-3.5" />
      </Button>

      {/* SQL Workbench */}
      <Button
        size="sm"
        variant="outline"
        onClick={onOpenSql}
        className="h-7 shrink-0 px-2 font-sans text-xs"
        title={UI_COPY.COMMON.ACTIONS.OPEN_SQL}
      >
        <Database className="size-3.5 sm:mr-1" />
        <span className="hidden sm:inline">{UI_COPY.COMMON.ACTIONS.SQL}</span>
      </Button>

      {/* Copilot Drawer Trigger */}
      <Button
        size="sm"
        onClick={onOpenCopilot}
        className="h-7 shrink-0 font-sans text-xs shadow-sm"
        title={UI_COPY.COMMON.ACTIONS.OPEN_COPILOT}
      >
        <Sparkles className="size-3.5 sm:mr-1" />
        <span className="hidden sm:inline">{UI_COPY.COMMON.ACTIONS.COPILOT}</span>
      </Button>

      <Separator orientation="vertical" className="hidden h-5 shrink-0 sm:block" />
    </div>
  );
}
