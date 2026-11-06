/**
 * @file apps/web/src/app/(dashboard)/layout.tsx
 * @description Master SSR server layout for all telemetry and investigation workspaces.
 * Mounts the unified DashboardShell containing the persistent AppNavbar with zero layout shift.
 * @module @devlab/logs-web/app/(dashboard)
 */

import React from "react";
import { DashboardShell } from "@/components/layout";

export interface DashboardLayoutProps {
  /** Page content components rendered inside the active workspace shell */
  readonly children: React.ReactNode;
}

/**
 * Pure SSR Server Component layout for DevLab Logs telemetry studio.
 *
 * @param props - Layout properties containing children
 * @returns React JSX element rendering DashboardShell
 */
export default function DashboardLayout({ children }: DashboardLayoutProps): React.JSX.Element {
  return <DashboardShell>{children}</DashboardShell>;
}
