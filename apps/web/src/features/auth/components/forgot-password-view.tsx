"use client";

/**
 * @file apps/web/src/features/auth/components/forgot-password-view.tsx
 * @description Interactive client view for logs console password recovery.
 * @module @devlab/logs-web/features/auth
 */

import React from "react";
import { ForgotPassword } from "@yuva-devlab/auth-client";
import { APP_ROUTES } from "@/lib/constants/routes";

/**
 * Interactive password recovery view sending reset dispatch via DevLab IAM.
 *
 * @returns React JSX element rendering forgot password card
 */
export const ForgotPasswordView: React.FC = () => {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL ||
    process.env.NEXT_PUBLIC_DEVLAB_AUTH_URL ||
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    "http://localhost:3015";

  return <ForgotPassword apiBaseUrl={apiBaseUrl} signInUrl={APP_ROUTES.LOGIN} />;
};
