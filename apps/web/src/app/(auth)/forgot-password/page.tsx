/**
 * @file apps/web/src/app/(auth)/forgot-password/page.tsx
 * @description Pure SSR Server Component route for password recovery.
 * @module @devlab/logs-web/app/(auth)/forgot-password
 */

import React from "react";
import type { Metadata } from "next";
import { ForgotPasswordView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Forgot Password — DevLab Logs",
  description: "Recover access to your DevLab Logs telemetry workspace",
};

/**
 * Server Component route wrapper rendering password recovery view.
 *
 * @returns React JSX element rendering ForgotPasswordView
 */
export default function ForgotPasswordPage(): React.JSX.Element {
  return <ForgotPasswordView />;
}
