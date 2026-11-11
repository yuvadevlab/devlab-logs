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
    <div className="dl-navbar__controls">
      {/* Throughput & Buffer Info (Visible on ultra-wide screens to keep laptop header clean) */}
      <div className="dl-navbar__stats">
        <span>
          <span style={{ color: "var(--foreground)", fontWeight: 600 }}>{eps.toFixed(1)}</span>{" "}
          {UI_COPY.LOGS.HEADER.EPS}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {UI_COPY.LOGS.HEADER.BUFFER_LABEL}
          <span className="dl-navbar__progress-track">
            <span className="dl-navbar__progress-fill" style={{ width: `${bufferPct}%` }} />
          </span>
          <span style={{ color: "var(--foreground)" }}>{bufferCount}</span>
        </span>
      </div>

      {/* Responsive Time Window Range Selector */}
      <NavbarTimeRange range={range} setRange={setRange} custom={custom} setCustom={setCustom} />

      {/* Auto-Scroll Toggle (Visible on wide displays >= 1280px) */}
      <label className="dl-navbar__autoscroll-label">
        <ArrowDownToLine className="dl-navbar__autoscroll-icon" />
        <Switch
          checked={autoScroll}
          onCheckedChange={setAutoScroll}
          className="dl-navbar__autoscroll-switch"
        />
      </label>

      {/* Stream Play / Pause */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggleStream}
        className="dl-navbar__action-btn"
        title={
          stream === StreamState.PAUSED
            ? UI_COPY.COMMON.ACTIONS.RESUME_STREAM
            : UI_COPY.COMMON.ACTIONS.PAUSE_STREAM
        }
      >
        {stream === StreamState.PAUSED ? (
          <Play className="dl-navbar__action-icon dl-navbar__action-icon--play" />
        ) : (
          <Pause className="dl-navbar__action-icon" />
        )}
      </Button>

      {/* Clear Logs */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearLogs}
        className="dl-navbar__action-btn"
        title={UI_COPY.COMMON.ACTIONS.CLEAR}
      >
        <Eraser className="dl-navbar__action-icon" />
      </Button>

      {/* SQL Workbench */}
      <Button
        size="sm"
        variant="outline"
        onClick={onOpenSql}
        className="dl-navbar__action-btn dl-navbar__action-btn--sql"
        title={UI_COPY.COMMON.ACTIONS.OPEN_SQL}
      >
        <Database className="dl-navbar__action-icon dl-navbar__action-icon--database" />
        <span className="dl-navbar__action-sql-text">{UI_COPY.COMMON.ACTIONS.SQL}</span>
      </Button>

      <Separator orientation="vertical" className="dl-navbar__controls-separator" />
    </div>
  );
}
