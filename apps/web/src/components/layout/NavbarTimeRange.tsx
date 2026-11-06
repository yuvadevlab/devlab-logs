/**
 * @file apps/web/src/components/layout/NavbarTimeRange.tsx
 * @description Responsive time-range picker for the navbar with compact laptop collapsing.
 * Shows full button bar on wide displays (>= 1280px) and a compact dropdown on laptops.
 * @module @devlab/logs-web/components/layout/NavbarTimeRange
 */

"use client";

import React, { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { Button, Input, Popover, PopoverTrigger, PopoverContent } from "@devlab-logs/ui";
import { TimeRangeKey, type TimeWindow } from "@/features/logs/types";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

export interface NavbarTimeRangeProps {
  /** Active selected time range */
  readonly range: TimeRangeKey;
  /** Range selection update callback */
  readonly setRange: (r: TimeRangeKey) => void;
  /** Custom datetime boundary values */
  readonly custom: TimeWindow;
  /** Custom datetime update dispatcher */
  readonly setCustom: React.Dispatch<React.SetStateAction<TimeWindow>>;
}

const PRESET_RANGES = [
  TimeRangeKey.FIVE_MINUTES,
  TimeRangeKey.FIFTEEN_MINUTES,
  TimeRangeKey.ONE_HOUR,
  TimeRangeKey.TWENTY_FOUR_HOURS,
] as const;

/**
 * Responsive time window selector with full and compact viewports.
 */
export function NavbarTimeRange({
  range,
  setRange,
  custom,
  setCustom,
}: NavbarTimeRangeProps): React.JSX.Element {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <div className="flex shrink-0 items-center">
      {/* Full Preset Bar on Wide Displays (>= 1280px) */}
      <div className="border-border/60 bg-muted/30 hidden shrink-0 items-center rounded-md border p-0.5 font-mono text-xs xl:flex">
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
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
              onClick={() => {
                setRange(TimeRangeKey.CUSTOM);
                setPopoverOpen(false);
              }}
            >
              {UI_COPY.LOGS.FILTERS.APPLY_RANGE}
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Compact Dropdown on Laptop / Tablet Displays (< 1280px) */}
      <div className="flex shrink-0 xl:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 shrink-0 px-2 font-mono text-xs"
              title="Time window"
            >
              <Clock className="text-muted-foreground mr-1 size-3" />
              <span>{range}</span>
              <ChevronDown className="ml-1 size-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-64 max-w-[calc(100vw-2rem)] space-y-2.5 p-3 shadow-xl"
          >
            <div className="text-xs font-semibold">{UI_COPY.LOGS.FILTERS.CUSTOM_RANGE}</div>
            <div className="grid grid-cols-4 gap-1 font-mono text-xs">
              {PRESET_RANGES.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={range === r ? "default" : "outline"}
                  onClick={() => setRange(r)}
                  className="h-7 text-[11px]"
                >
                  {r}
                </Button>
              ))}
            </div>
            <div className="space-y-1.5 pt-1">
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
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
