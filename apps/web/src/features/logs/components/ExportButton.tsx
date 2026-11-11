"use client";

import React, { useState } from "react";
import { FileJson, Download } from "lucide-react";
import { Button, Progress, toast } from "@devlab-logs/ui";
import { ExportFormat, type LogEvent } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

export interface ExportButtonProps {
  format: ExportFormat;
  rows: LogEvent[];
}

/**
 * Button triggering asynchronous browser export of telemetry logs as JSONL or Parquet.
 */
export function ExportButton({ format, rows }: ExportButtonProps) {
  const [progress, setProgress] = useState<number | null>(null);

  const isJsonl = format === ExportFormat.JSONL;
  const label = isJsonl ? "JSONL" : "Parquet";

  const runExport = () => {
    setProgress(0);
    let v = 0;
    const t = setInterval(() => {
      v += 25;
      if (v >= 100) {
        clearInterval(t);
        setProgress(null);
        const body = isJsonl
          ? rows
              .map((r) =>
                JSON.stringify({
                  ts: new Date(r.ts).toISOString(),
                  level: r.level,
                  service: r.service,
                  trace_id: r.traceId,
                  message: r.message,
                  ...r.meta,
                }),
              )
              .join("\n")
          : JSON.stringify({
              format: ExportFormat.PARQUET,
              rows: rows.length,
              schema: ["ts", "level", "service", "trace_id", "message"],
            });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([body], { type: "application/octet-stream" }));
        a.download = `devlab-logs-${Date.now()}.${format}`;
        a.click();
        toast.success(UI_COPY.LOGS.NOTIFICATIONS.EXPORTED(rows.length.toLocaleString(), label));
      } else {
        setProgress(v);
      }
    }, 100);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      style={{
        position: "relative",
        height: "2rem",
        width: "118px",
        overflow: "hidden",
        fontSize: "0.75rem",
      }}
      onClick={runExport}
      disabled={progress !== null || !rows.length}
    >
      {isJsonl ? (
        <FileJson className="dl-export__icon" />
      ) : (
        <Download className="dl-export__icon" />
      )}
      {progress !== null ? `${Math.round(progress)}%` : UI_COPY.LOGS.AI.EXPORT(label)}
      {progress !== null && (
        <Progress
          value={progress}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "0.125rem",
            borderRadius: 0,
          }}
        />
      )}
    </Button>
  );
}
