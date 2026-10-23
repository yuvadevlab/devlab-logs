"use client";

/**
 * @file apps/web/src/features/auth/components/login-view.tsx
 * @description Interactive client view for logs console sign-in with enterprise workspace auth.
 * @module @devlab/logs-web/features/auth
 */

import React from "react";
import { Activity } from "lucide-react";
import { SignIn } from "@yuva-devlab/auth-client";
import { APP_ROUTES } from "@/lib/constants/routes";

/**
 * Interactive login view rendering DevLab authentication card.
 * Handles credential dispatch, session token storage, and redirect to logs console.
 *
 * @returns React JSX element rendering sign-in form
 */
export const LoginView: React.FC = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL || "http://localhost:3015";

  return (
    <SignIn
      apiBaseUrl={apiBaseUrl}
      redirectTo={APP_ROUTES.HOME}
      forgotPasswordUrl={APP_ROUTES.FORGOT_PASSWORD}
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
