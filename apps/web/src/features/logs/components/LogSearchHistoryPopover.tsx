/**
 * @file apps/web/src/features/logs/components/LogSearchHistoryPopover.tsx
 * @description Quick history popover dropdown for recent query recalls.
 * @author yuva.devlab@gmail.com
 */

"use client";

import React from "react";
import { History } from "lucide-react";
import { Button, Popover, PopoverTrigger, PopoverContent } from "@devlab-logs/ui";

export interface LogSearchHistoryPopoverProps {
  history: string[];
  onSelectHistory: (query: string) => void;
}

export function LogSearchHistoryPopover({
  history,
  onSelectHistory,
}: LogSearchHistoryPopoverProps): React.JSX.Element {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          style={{ height: "1.5rem", padding: "0 0.375rem" }}
          title="Search history"
        >
          <History className="dl-toolbar__history-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="dl-toolbar__history-popover" align="end">
        <div
          style={{
            color: "var(--mutedForeground)",
            padding: "0.25rem 0.5rem",
            fontSize: "0.625rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Recent searches
        </div>
        {history.length > 0 ? (
          history.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onSelectHistory(h)}
              className="dl-toolbar__history-item"
              style={{
                display: "block",
                width: "100%",
                borderRadius: "0.25rem",
                padding: "0.375rem 0.5rem",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              {h}
            </button>
          ))
        ) : (
          <div
            style={{
              color: "var(--mutedForeground)",
              padding: "0.5rem",
              textAlign: "center",
              fontSize: "0.75rem",
            }}
          >
            No search history
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
