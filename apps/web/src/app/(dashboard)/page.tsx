/**
 * @file apps/web/src/app/(dashboard)/page.tsx
 * @description Pure SSR server route for the live telemetry log explorer.
 * @module @devlab/logs-web/app/(dashboard)
 */

import React from "react";
import type { Metadata } from "next";
import { Console } from "@/features/logs";

export const metadata: Metadata = {
  title: "Live Explorer — DevLab Logs",
  description:
    "Real-time distributed log streaming, facet filtering, DuckDB SQL analytics, and telemetry visualization.",
};

/**
 * Pure SSR Server Component route rendering the interactive telemetry console.
 *
 * @returns React JSX element rendering Console
 */
export default function TelemetryLogsPage(): React.JSX.Element {
  return <Console />;
}
