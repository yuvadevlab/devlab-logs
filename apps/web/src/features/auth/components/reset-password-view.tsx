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
    <div className="dl-auth-layout">
      <div className="dl-auth-card">
        <h1 className="dl-auth-title">Redirecting to Password Reset</h1>
        <p className="dl-auth-desc">Password resets are verified directly by DevLab Portal...</p>
      </div>
    </div>
  );
}
