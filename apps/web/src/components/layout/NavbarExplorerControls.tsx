/**
 * @file apps/web/src/components/layout/NavbarExplorerControls.tsx
 * @description Operational stream controls, time-window selectors, and tool triggers for the explorer.
 * Consumes the central ExplorerContext to maintain zero layout shift.
 * @module @devlab/logs-web/components/layout/NavbarExplorerControls
 */

"use client";

import React from "react";
import { Play, Pause, Database, Eraser, ArrowDownToLine } from "lucide-react";
import { Button, Switch, Separator } from "@devlab-logs/ui";
import { useExplorerContext } from "@/features/logs";
import { StreamState, TimeRangeKey, type TimeWindow } from "@/features/logs/types";
import { UI_COPY } from "@/lib/ui-copy";
import { NavbarTimeRange } from "./NavbarTimeRange";

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
}

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

      {/* Responsive Time Window Range Selector */}
      <NavbarTimeRange range={range} setRange={setRange} custom={custom} setCustom={setCustom} />

      {/* Auto-Scroll Toggle (Visible on wide displays >= 1280px) */}
      <label className="text-muted-foreground hover:text-foreground hidden shrink-0 cursor-pointer items-center gap-1.5 px-1 text-xs xl:flex">
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
        <Database className="size-3.5 xl:mr-1" />
        <span className="hidden xl:inline">{UI_COPY.COMMON.ACTIONS.SQL}</span>
      </Button>

      <Separator orientation="vertical" className="hidden h-5 shrink-0 sm:block" />
    </div>
  );
}
