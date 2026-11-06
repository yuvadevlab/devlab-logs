/**
 * @file apps/web/src/features/auth/components/reset-password-view.tsx
 * @description Client view for password reset delegating to DevLab Portal Central SSO.
 * @module @devlab/logs-web/features/auth
 */

"use client";

import React, { useEffect } from "react";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/constants/routes";

/**
 * Client view for password reset.
 * Redirects to DevLab Portal central password reset workflow.
 */
export function ResetPasswordView(): React.JSX.Element {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.RESET_PASSWORD();
    }
  }, []);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center select-none">
      <div className="border-border bg-card w-full max-w-md rounded-2xl border p-8 shadow-xl">
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          Redirecting to Password Reset
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Password resets are verified directly by DevLab Portal...
        </p>
      </div>
    </div>
  );
}
