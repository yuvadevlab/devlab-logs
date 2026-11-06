/**
 * @file apps/web/src/components/layout/DashboardShell.tsx
 * @description Master client application shell for the DevLab Logs telemetry studio.
 * Mounts the persistent AppNavbar and provides global telemetry stream state to all dashboard routes.
 * @module @devlab/logs-web/components/layout/DashboardShell
 */

"use client";

import React from "react";
import { ExplorerProvider } from "@/features/logs";
import { AppNavbar } from "./AppNavbar";

export interface DashboardShellProps {
  readonly children: React.ReactNode;
}

/**
 * Enterprise dashboard shell mounting AppNavbar centrally with zero-layout-shift routing.
 */
export function DashboardShell({ children }: DashboardShellProps): React.JSX.Element {
  return (
    <ExplorerProvider>
      <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden select-none">
        <AppNavbar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </ExplorerProvider>
  );
}
