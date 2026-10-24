"use client";

import React from "react";
import {
  Activity,
  ArrowDownToLine,
  Database,
  Eraser,
  Pause,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
} from "@devlab-logs/ui";
import { Environment, StreamState, type TimeRangeKey, type TimeWindow } from "../types";
import { UserButton } from "@yuva-devlab/auth-client";
import { UI_COPY } from "@/lib/ui-copy";
import { StreamBadge, TimeRangeControl } from "./HeaderControls";

export interface LogHeaderProps {
  env: Environment;
  setEnv: (env: Environment) => void;
  stream: StreamState;
  onToggleStream: () => void;
  eps: number;
  bufferCount: number;
  maxBuffer: number;
  range: TimeRangeKey;
  setRange: (r: TimeRangeKey) => void;
  custom: TimeWindow;
  setCustom: React.Dispatch<React.SetStateAction<TimeWindow>>;
  autoScroll: boolean;
  setAutoScroll: (v: boolean | ((p: boolean) => boolean)) => void;
  onClearLogs: () => void;
  onOpenSql: () => void;
  onOpenAi: () => void;
  onOpenCmd: () => void;
}

export function LogHeader({
  env,
  setEnv,
  stream,
  onToggleStream,
  eps,
  bufferCount,
  maxBuffer,
  range,
  setRange,
  custom,
  setCustom,
  autoScroll,
  setAutoScroll,
  onClearLogs,
  onOpenSql,
  onOpenAi,
  onOpenCmd,
}: LogHeaderProps) {
  const bufferPct = Math.min(100, Math.round((bufferCount / maxBuffer) * 100));

  return (
    <header className="panel flex flex-wrap items-center gap-3 p-3">
      {/* Brand Identity */}
      <div className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground glow grid size-8 place-items-center rounded-md">
          <Activity className="size-4" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">{UI_COPY.COMMON.BRAND}</div>
          <div className="text-muted-foreground font-mono text-[10px]">
            {UI_COPY.COMMON.TELEMETRY_TAGLINE}
          </div>
        </div>
      </div>

      {/* Environment Selector */}
      <Select value={env} onValueChange={(val) => setEnv(val as Environment)}>
        <SelectTrigger className="h-8 w-[130px] font-mono text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={Environment.PRODUCTION}>
            {UI_COPY.COMMON.ENVIRONMENT.PRODUCTION}
          </SelectItem>
          <SelectItem value={Environment.STAGING}>{UI_COPY.COMMON.ENVIRONMENT.STAGING}</SelectItem>
          <SelectItem value={Environment.DEVELOPMENT}>
            {UI_COPY.COMMON.ENVIRONMENT.DEVELOPMENT}
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Live Stream Badge */}
      <StreamBadge state={stream} />

      {/* Throughput & Buffer Info */}
      <div className="text-muted-foreground hidden items-center gap-4 font-mono text-xs lg:flex">
        <span>
          <span className="text-foreground">{eps.toFixed(1)}</span>{" "}
          {UI_COPY.LOGS.HEADER.EVENTS_PER_SECOND}
        </span>
        <span className="flex items-center gap-2">
          {UI_COPY.LOGS.HEADER.BUFFER}
          <span className="bg-muted h-1.5 w-20 overflow-hidden rounded">
            <span
              className="bg-primary block h-full transition-all"
              style={{ width: `${bufferPct}%` }}
            />
          </span>
          <span className="text-foreground">{bufferCount.toLocaleString()}</span>/{maxBuffer / 1000}
          k
        </span>
      </div>

      {/* Action Controls */}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <TimeRangeControl range={range} setRange={setRange} custom={custom} setCustom={setCustom} />

        <label className="flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
          <ArrowDownToLine className="size-3.5" /> {UI_COPY.LOGS.HEADER.AUTO_SCROLL}
          <Switch checked={autoScroll} onCheckedChange={setAutoScroll} className="scale-75" />
        </label>

        <Button size="sm" variant="secondary" onClick={onToggleStream}>
          {stream === StreamState.PAUSED ? (
            <Play className="mr-1 size-3" />
          ) : (
            <Pause className="mr-1 size-3" />
          )}
          {stream === StreamState.PAUSED
            ? UI_COPY.COMMON.ACTIONS.RESUME
            : UI_COPY.COMMON.ACTIONS.PAUSE}
        </Button>

        <Button size="sm" variant="ghost" onClick={onClearLogs}>
          <Eraser className="mr-1 size-3" />
          {UI_COPY.COMMON.ACTIONS.CLEAR}
        </Button>

        <Button size="sm" variant="outline" onClick={onOpenSql}>
          <Database className="mr-1 size-3" />
          {UI_COPY.COMMON.ACTIONS.SQL}
        </Button>

        <Button size="sm" onClick={onOpenAi} className="glow">
          <Sparkles className="mr-1 size-3" />
          {UI_COPY.COMMON.ACTIONS.ASK_AI}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onOpenCmd}
          className="text-muted-foreground font-mono text-xs"
        >
          <Search className="mr-1 size-3" />
          ⌘K
        </Button>

        <UserButton />
      </div>
    </header>
  );
}
