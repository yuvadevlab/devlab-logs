"use client";

import React from "react";
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Badge } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { StreamState, TimeRangeKey, type TimeWindow } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

const STREAM_STATE_CONFIG: Record<
  StreamState,
  { label: string; subtext: string; colorClass: string }
> = {
  [StreamState.LIVE]: {
    label: "LIVE STREAMING",
    subtext: "Connected",
    colorClass: "dl-badge--info",
  },
  [StreamState.PAUSED]: {
    label: "PAUSED",
    subtext: "Buffering off",
    colorClass: "dl-badge--warn",
  },
  [StreamState.RECONNECTING]: {
    label: "RECONNECTING",
    subtext: "WS retry",
    colorClass: "dl-badge--error",
  },
  [StreamState.DISCONNECTED]: {
    label: "DISCONNECTED",
    subtext: "Offline",
    colorClass: "dl-badge--debug",
  },
};

export function StreamBadge({ state }: { state: StreamState }) {
  const config = STREAM_STATE_CONFIG[state] ?? STREAM_STATE_CONFIG[StreamState.RECONNECTING];

  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[11px]", config.colorClass)}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.5rem" }}
    >
      <span
        style={{
          width: "0.5rem",
          height: "0.5rem",
          borderRadius: "9999px",
          backgroundColor: "currentColor",
        }}
        className={cn(
          state !== StreamState.PAUSED && state !== StreamState.DISCONNECTED && "pulse-dot",
        )}
      />
      <span style={{ fontWeight: 600 }}>{config.label}</span>
      <span style={{ color: "var(--mutedForeground)" }}>({config.subtext})</span>
    </Badge>
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
    <div className="dl-navbar__time-presets" style={{ display: "flex" }}>
      {PRESET_RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          className={cn("dl-navbar__time-btn", range === r && "dl-navbar__time-btn--active")}
        >
          {r}
        </button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "dl-navbar__time-btn",
              range === TimeRangeKey.CUSTOM && "dl-navbar__time-btn--active",
            )}
          >
            {UI_COPY.LOGS.FILTERS.CUSTOM}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="dl-header-controls__popover"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          align="end"
        >
          <div style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            {UI_COPY.LOGS.FILTERS.CUSTOM_RANGE}
          </div>
          <Input
            type="datetime-local"
            value={custom.from}
            onChange={(e) => setCustom((prev) => ({ ...prev, from: e.target.value }))}
            className="dl-header-controls__input"
          />
          <Input
            type="datetime-local"
            value={custom.to}
            onChange={(e) => setCustom((prev) => ({ ...prev, to: e.target.value }))}
            className="dl-header-controls__input"
          />
          <Button
            size="sm"
            style={{ width: "100%" }}
            disabled={!custom.from || !custom.to}
            onClick={() => setRange(TimeRangeKey.CUSTOM)}
          >
            {UI_COPY.LOGS.FILTERS.APPLY_RANGE}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
