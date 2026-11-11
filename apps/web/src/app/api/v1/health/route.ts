/**
 * @file apps/web/src/app/api/v1/health/route.ts
 * @description Health probe route handler for DevLab Logs Web frontend.
 * @module @devlab/logs-web/api/v1/health
 */

import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "devlab-logs-web",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
