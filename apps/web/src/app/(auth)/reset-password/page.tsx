/**
 * @file apps/web/src/app/(auth)/reset-password/page.tsx
 * @description Pure SSR Server Component route for resetting account password.
 * @module @devlab/logs-web/app/(auth)/reset-password
 */

import React from "react";
import type { Metadata } from "next";
import { ResetPasswordView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Reset Password — DevLab Logs",
  description: "Set a new secure password for your DevLab Logs workspace",
};

/**
 * Server Component route wrapper rendering password reset view.
 *
 * @returns React JSX element rendering ResetPasswordView
 */
export default function ResetPasswordPage(): React.JSX.Element {
  return <ResetPasswordView />;
}
