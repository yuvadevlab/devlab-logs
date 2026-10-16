/**
 * @file apps/web/src/app/(auth)/layout.tsx
 * @description Pure SSR server layout wrapper for authentication routes.
 * @module @devlab/logs-web/app/(auth)
 */

import React from "react";
import { Activity } from "lucide-react";

/**
 * Properties for the SSR authentication layout wrapper.
 */
export interface AuthLayoutProps {
  /** Child view component to render inside the auth container */
  readonly children: React.ReactNode;
}

/**
 * Pure Server Component rendering centered DevLab Logs branded authentication backdrop.
 *
 * @param props - Layout props containing children
 * @returns Server-rendered layout element
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center p-6">
      {/* DevLab Logs Brand Header */}
      <div className="mb-8 flex items-center gap-3">
        <span className="bg-primary text-primary-foreground glow flex size-10 items-center justify-center rounded-lg shadow-md">
          <Activity className="size-5" strokeWidth={2.5} />
        </span>
        <div className="leading-tight">
          <span className="text-foreground block text-xl font-bold tracking-tight">
            DevLab Logs
          </span>
          <span className="text-muted-foreground block font-mono text-[11px]">
            telemetry · kafka · duckdb
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
