/**
 * @file apps/web/src/features/logs/components/LogRowQuickActions.tsx
 * @description Hover quick-action buttons for copying message/trace and inspecting log rows.
 * @module @devlab/logs-web/features/logs/components/LogRowQuickActions
 */

"use client";

import React from "react";
import { Copy, GitBranch, Activity, Eye } from "lucide-react";
import { toast } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { LogEvent } from "../types";

export interface LogRowQuickActionsProps {
  /** Log record to act upon */
  readonly log: LogEvent;
  /** Callback to toggle payload json viewer */
  readonly onToggle: () => void;
  /** Callback to inspect trace spans */
  readonly onInspect: () => void;
}

/**
 * Floating hover quick action toolbar for LogRow.
 */
export function LogRowQuickActions({
  log,
  onToggle,
  onInspect,
}: LogRowQuickActionsProps): React.JSX.Element {
  const copyText = (t: string, label: string) => {
    navigator.clipboard?.writeText(t).catch(() => {});
    toast.success(UI_COPY.LOGS.NOTIFICATIONS.COPIED(label));
  };

  return (
    <div className="dl-log-row__quick-actions">
      <button
        type="button"
        title={UI_COPY.LOGS.ROW_ACTIONS.COPY_MESSAGE}
        onClick={(e) => {
          e.stopPropagation();
          copyText(log.message, UI_COPY.LOGS.NOTIFICATIONS.MESSAGE);
        }}
        className="dl-log-row__action-btn"
      >
        <Copy className="dl-log-row__quick-glyph" />
      </button>
      <button
        type="button"
        title={UI_COPY.LOGS.ROW_ACTIONS.COPY_TRACE_ID}
        onClick={(e) => {
          e.stopPropagation();
          copyText(log.traceId, UI_COPY.LOGS.NOTIFICATIONS.TRACE_ID);
        }}
        className="dl-log-row__action-btn"
      >
        <GitBranch className="dl-log-row__quick-glyph" />
      </button>
      <button
        type="button"
        title={UI_COPY.LOGS.ROW_ACTIONS.VIEW_TRACE_SPANS}
        onClick={(e) => {
          e.stopPropagation();
          onInspect();
        }}
        className="dl-log-row__action-btn"
      >
        <Activity className="dl-log-row__quick-glyph" />
      </button>
      <button
        type="button"
        title={UI_COPY.LOGS.ROW_ACTIONS.INSPECT_PAYLOAD}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="dl-log-row__action-btn"
      >
        <Eye className="dl-log-row__quick-glyph" />
      </button>
    </div>
  );
}
