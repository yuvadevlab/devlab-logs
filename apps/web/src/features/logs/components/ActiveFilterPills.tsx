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
    <div className="flex flex-wrap items-center gap-1.5 pl-1">
      {levels.map((lv) => (
        <Badge
          key={lv}
          variant="outline"
          className={cn("items-center gap-1 font-mono text-[10px]", LEVEL_CLASS[lv])}
        >
          {lv}
          <button
            type="button"
            onClick={() => setLevels((prev) => prev.filter((x) => x !== lv))}
            className="cursor-pointer opacity-60 hover:opacity-100"
            title={`Remove ${lv} filter`}
          >
            <X className="size-2.5" />
          </button>
        </Badge>
      ))}

      {services.map((s) => (
        <Badge
          key={s}
          variant="secondary"
          className="border-primary/30 text-foreground items-center gap-1 font-mono text-[10px]"
        >
          {s}
          <button
            type="button"
            onClick={() => setServices(services.filter((x) => x !== s))}
            className="cursor-pointer opacity-60 hover:opacity-100"
            title={`Remove ${s} filter`}
          >
            <X className="size-2.5" />
          </button>
        </Badge>
      ))}

      <Button
        size="sm"
        variant="ghost"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground h-6 px-1.5 text-[10px]"
        title="Clear all active filters"
      >
        <FilterX className="mr-1 size-3" />
        Clear
      </Button>
    </div>
  );
}
