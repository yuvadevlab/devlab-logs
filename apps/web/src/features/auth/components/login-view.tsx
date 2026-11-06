/**
 * @file apps/web/src/features/auth/components/login-view.tsx
 * @description Client view for DevLab Logs authentication delegating to DevLab Portal Central SSO.
 * Modeled after FinAI's authentication handoff pattern.
 * @module @devlab/logs-web/features/auth
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { SpinnerIcon } from "@devlab-logs/ui";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/constants/routes";

/**
 * Client view for DevLab Logs authentication.
 * Automatically purges stale session markers and delegates to DevLab Portal Central SSO.
 */
export function LoginView(): React.JSX.Element {
  const purgeAndRedirect = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("devlab_token");
      localStorage.removeItem("devlab_user");
      localStorage.removeItem("devlab_access_token");
      localStorage.removeItem("devlab_auth_token");
      localStorage.removeItem("devlab_auth_user");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "devlab_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = DEVLAB_PORTAL_ROUTES.LOGIN(window.location.origin);
    }
  }, []);

  useEffect(() => {
    purgeAndRedirect();
  }, [purgeAndRedirect]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center select-none">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl">
        <div className="bg-primary/10 text-primary mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl">
          <SpinnerIcon className="size-8 animate-spin" />
        </div>

        <h1 className="text-foreground text-xl font-bold tracking-tight">
          Redirecting to DevLab SSO
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Single Sign-On is required to access DevLab Logs. You are being redirected to the DevLab
          Portal...
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={purgeAndRedirect}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20 inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium shadow transition focus:ring-2 focus:outline-none"
          >
            Continue to DevLab Portal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
