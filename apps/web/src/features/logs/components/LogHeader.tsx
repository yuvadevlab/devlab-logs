/**
 * @file apps/web/src/features/logs/components/LogHeader.tsx
 * @description Backward-compatible wrapper delegating to the unified AppNavbar.
 * Prevents layout shifts by ensuring single-component top-nav rendering.
 * @module @devlab/logs-web/features/logs/components/LogHeader
 */

"use client";

import React from "react";
import { AppNavbar, type AppNavbarProps } from "@/components/layout/AppNavbar";

export type LogHeaderProps = AppNavbarProps;

export function LogHeader(props: LogHeaderProps) {
  return <AppNavbar {...props} />;
}
