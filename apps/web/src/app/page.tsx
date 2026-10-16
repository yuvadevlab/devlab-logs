import React from "react";
import type { Metadata } from "next";
import { Console } from "@/features/logs";

export const metadata: Metadata = {
  title: "DevLab Logs — Real-time Telemetry & Log Analytics",
  description:
    "Live distributed log streaming, trace inspection, DuckDB SQL analytics, and Log-RAG root-cause analysis.",
};

/**
 * Pure SSR Server Component wrapping the interactive Observability Console.
 */
export default function TelemetryLogsPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Console />
    </main>
  );
}
