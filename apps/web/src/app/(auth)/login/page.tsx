/**
 * @file apps/web/src/app/(auth)/login/page.tsx
 * @description Pure SSR Server Component route for DevLab Logs sign-in.
 * @module @devlab/logs-web/app/(auth)/login
 */

import React from "react";
import type { Metadata } from "next";
import { LoginView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign In — DevLab Logs",
  description: "Sign in to your DevLab Logs telemetry and observability workspace",
};

/**
 * Server Component route wrapper rendering interactive login view.
 *
 * @returns React JSX element rendering LoginView
 */
export default function LoginPage(): React.JSX.Element {
  return <LoginView />;
}
