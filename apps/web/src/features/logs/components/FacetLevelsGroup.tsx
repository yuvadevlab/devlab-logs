/**
 * @file apps/web/src/features/logs/components/FacetLevelsGroup.tsx
 * @description Severity level facet category list and quick filtering.
 * @author yuva.devlab@gmail.com
 */

"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LEVEL_CLASS } from "@/lib/logs";
import { LogLevel } from "../types";

const LEVELS = [
  LogLevel.FATAL,
  LogLevel.ERROR,
  LogLevel.WARN,
  LogLevel.INFO,
  LogLevel.DEBUG,
] as const;

export interface FacetLevelsGroupProps {
  levels: LogLevel[];
  levelCounts: Record<LogLevel, number>;
  toggleLevel: (l: LogLevel) => void;
  clearLevels: () => void;
}

export function FacetLevelsGroup({
  levels,
  levelCounts,
  toggleLevel,
  clearLevels,
}: FacetLevelsGroupProps): React.JSX.Element {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.25rem 0.375rem",
          fontSize: "0.625rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--mutedForeground)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <AlertTriangle className="dl-facets__category-icon" style={{ color: "var(--warn)" }} />
          Levels
        </span>
        {levels.length > 0 && (
          <button
            type="button"
            onClick={clearLevels}
            style={{
              color: "var(--primary)",
              cursor: "pointer",
              textTransform: "lowercase",
              background: "none",
              border: "none",
              padding: 0,
            }}
            className="dl-facets__reset-btn"
          >
            reset
          </button>
        )}
      </div>
      <div
        style={{
          marginTop: "0.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
        }}
      >
        {LEVELS.map((lv) => {
          const isSelected = levels.includes(lv);
          const count = levelCounts[lv];
          return (
            <div
              key={lv}
              onClick={() => toggleLevel(lv)}
              className={cn("dl-facets__item", isSelected && "dl-facets__item--active")}
            >
              <Badge
                variant="outline"
                className={cn("dl-badge", LEVEL_CLASS[lv])}
                style={{ padding: "0 0.25rem" }}
              >
                {lv}
              </Badge>
              <span
                style={{
                  color: "var(--mutedForeground)",
                  fontSize: "0.625rem",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
