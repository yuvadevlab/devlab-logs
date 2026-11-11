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
    <div style={{ display: "flex", flexShrink: 0, alignItems: "center" }}>
      {/* Full Preset Bar on Wide Displays (>= 1280px) */}
      <div className="dl-navbar__time-presets">
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
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
            align="end"
            side="bottom"
            sideOffset={8}
            avoidCollisions={false}
            className="dl-navbar__time-popover-wide"
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {UI_COPY.LOGS.FILTERS.CUSTOM_RANGE}
            </div>
            <Input
              type="datetime-local"
              value={custom.from}
              onChange={(e) => setCustom((prev) => ({ ...prev, from: e.target.value }))}
              className="dl-navbar__time-input"
            />
            <Input
              type="datetime-local"
              value={custom.to}
              onChange={(e) => setCustom((prev) => ({ ...prev, to: e.target.value }))}
              className="dl-navbar__time-input"
            />
            <Button
              size="sm"
              style={{ width: "100%" }}
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
      <div className="dl-navbar__time-compact">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="dl-navbar__time-trigger-btn"
              title="Time window"
            >
              <Clock
                className="dl-navbar__time-clock-icon"
                style={{ color: "var(--mutedForeground)" }}
              />
              <span>{range}</span>
              <ChevronDown className="dl-navbar__time-chevron-icon" style={{ opacity: 0.6 }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="dl-navbar__time-popover-compact"
            style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              {UI_COPY.LOGS.FILTERS.CUSTOM_RANGE}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "0.25rem",
              }}
              className="dl-navbar__time-presets-grid"
            >
              {PRESET_RANGES.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={range === r ? "default" : "outline"}
                  onClick={() => setRange(r)}
                  style={{ height: "1.75rem", fontSize: "0.6875rem" }}
                >
                  {r}
                </Button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
                paddingTop: "0.25rem",
              }}
            >
              <Input
                type="datetime-local"
                value={custom.from}
                onChange={(e) => setCustom((prev) => ({ ...prev, from: e.target.value }))}
                className="dl-navbar__time-input"
              />
              <Input
                type="datetime-local"
                value={custom.to}
                onChange={(e) => setCustom((prev) => ({ ...prev, to: e.target.value }))}
                className="dl-navbar__time-input"
              />
              <Button
                size="sm"
                style={{ width: "100%" }}
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
