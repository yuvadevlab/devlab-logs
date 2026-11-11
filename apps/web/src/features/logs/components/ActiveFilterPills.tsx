/**
 * @file apps/web/src/features/logs/components/ActiveFilterPills.tsx
 * @description Renders removable chips for active severity levels and service filters.
 * Employs DevLab Shared Badge and Button components.
 * @module @devlab/logs-web/features/logs/components/ActiveFilterPills
 */

"use client";

import React from "react";
import { X, FilterX } from "lucide-react";
import { Badge, Button } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS } from "@/lib/logs";
import { LogLevel, ServiceName } from "../types";

export interface ActiveFilterPillsProps {
  levels: LogLevel[];
  setLevels: (l: LogLevel[] | ((p: LogLevel[]) => LogLevel[])) => void;
  services: ServiceName[];
  setServices: (s: ServiceName[]) => void;
  onClearAll: () => void;
}

export function ActiveFilterPills({
  levels,
  setLevels,
  services,
  setServices,
  onClearAll,
}: ActiveFilterPillsProps) {
  const hasFilters = levels.length > 0 || services.length > 0;
  if (!hasFilters) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.375rem",
        paddingLeft: "0.25rem",
      }}
    >
      {levels.map((lv) => (
        <Badge
          key={lv}
          variant="outline"
          className={cn("dl-pills__badge", LEVEL_CLASS[lv])}
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
        >
          {lv}
          <button
            type="button"
            onClick={() => setLevels((prev) => prev.filter((x) => x !== lv))}
            className="hover:opacity-100"
            style={{
              cursor: "pointer",
              opacity: 0.6,
              background: "none",
              border: "none",
              padding: 0,
              color: "inherit",
            }}
            title={`Remove ${lv} filter`}
          >
            <X className="dl-pills__close-icon" />
          </button>
        </Badge>
      ))}

      {services.map((s) => (
        <Badge
          key={s}
          variant="secondary"
          className="dl-pills__badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
            color: "var(--foreground)",
          }}
        >
          {s}
          <button
            type="button"
            onClick={() => setServices(services.filter((x) => x !== s))}
            className="hover:opacity-100"
            style={{
              cursor: "pointer",
              opacity: 0.6,
              background: "none",
              border: "none",
              padding: 0,
              color: "inherit",
            }}
            title={`Remove ${s} filter`}
          >
            <X className="dl-pills__close-icon" />
          </button>
        </Badge>
      ))}

      <Button
        size="sm"
        variant="ghost"
        onClick={onClearAll}
        style={{
          height: "1.5rem",
          padding: "0 0.375rem",
          fontSize: "0.625rem",
          color: "var(--mutedForeground)",
        }}
        title="Clear all active filters"
      >
        <FilterX className="dl-pills__clear-icon" />
        Clear
      </Button>
    </div>
  );
}
