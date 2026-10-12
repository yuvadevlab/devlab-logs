"use client";

import React from "react";
import { Button, Input, Popover, PopoverTrigger, PopoverContent } from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { StreamState, TimeRangeKey, type TimeWindow } from "../types";

const STREAM_STATE_CONFIG: Record<
  StreamState,
  { label: string; subtext: string; colorClass: string }
> = {
  [StreamState.LIVE]: {
    label: "LIVE STREAMING",
    subtext: "Connected",
    colorClass: "text-primary",
  },
  [StreamState.PAUSED]: {
    label: "PAUSED",
    subtext: "Buffering off",
    colorClass: "text-warn",
  },
  [StreamState.RECONNECTING]: {
    label: "RECONNECTING",
    subtext: "WS retry",
    colorClass: "text-error",
  },
  [StreamState.DISCONNECTED]: {
    label: "DISCONNECTED",
    subtext: "Offline",
    colorClass: "text-muted-foreground",
  },
};

export function StreamBadge({ state }: { state: StreamState }) {
  const config = STREAM_STATE_CONFIG[state] ?? STREAM_STATE_CONFIG[StreamState.RECONNECTING];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-[11px]",
        config.colorClass,
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full bg-current",
          state !== StreamState.PAUSED && state !== StreamState.DISCONNECTED && "pulse-dot",
        )}
      />
      <span className="font-semibold">{config.label}</span>
      <span className="text-muted-foreground">({config.subtext})</span>
    </div>
  );
}

const PRESET_RANGES = [
  TimeRangeKey.FIVE_MINUTES,
  TimeRangeKey.FIFTEEN_MINUTES,
  TimeRangeKey.ONE_HOUR,
  TimeRangeKey.TWENTY_FOUR_HOURS,
] as const;

export function TimeRangeControl({
  range,
  setRange,
  custom,
  setCustom,
}: {
  range: TimeRangeKey;
  setRange: (r: TimeRangeKey) => void;
  custom: TimeWindow;
  setCustom: React.Dispatch<React.SetStateAction<TimeWindow>>;
}) {
  return (
    <div className="flex items-center rounded-md border p-0.5 font-mono text-xs">
      {PRESET_RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          className={cn(
            "cursor-pointer rounded px-2 py-1",
            range === r
              ? "bg-accent text-foreground"
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
              "cursor-pointer rounded px-2 py-1",
              range === TimeRangeKey.CUSTOM
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Custom
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-2 p-3" align="end">
          <div className="text-xs font-medium">Custom range</div>
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
            Apply range
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
