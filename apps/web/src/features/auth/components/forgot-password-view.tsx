"use client";

/**
 * @file apps/web/src/features/auth/components/forgot-password-view.tsx
 * @description Interactive client view for logs console password recovery.
 * @module @devlab/logs-web/features/auth
 */

import React from "react";
import { Activity } from "lucide-react";
import { ForgotPassword } from "@yuva-devlab/auth-client";
import { APP_ROUTES } from "@/lib/constants/routes";

/**
 * Interactive password recovery view sending reset dispatch via DevLab IAM.
 *
 * @returns React JSX element rendering forgot password card
 */
export const ForgotPasswordView: React.FC = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL || "http://localhost:3015";

  return (
    <ForgotPassword
      apiBaseUrl={apiBaseUrl}
      signInUrl={APP_ROUTES.LOGIN}
      brand="logs"
      theme="logs-dark"
      logo={
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground glow flex size-10 items-center justify-center rounded-lg shadow-md">
            <Activity className="size-5" strokeWidth={2.5} />
          </span>
          <span className="text-foreground text-xl font-bold tracking-tight">DevLab Logs</span>
        </div>
      }
      fullPage
    />
  );
};
