/**
 * @file apps/web/src/features/auth/components/forgot-password-view.tsx
 * @description Client view for password recovery delegating to DevLab Portal Central SSO.
 * @module @devlab/logs-web/features/auth
 */

"use client";

import React, { useEffect } from "react";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/constants/routes";

/**
 * Client view for password recovery.
 * Redirects to DevLab Portal central password recovery workflow.
 */
export function ForgotPasswordView(): React.JSX.Element {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = DEVLAB_PORTAL_ROUTES.FORGOT_PASSWORD();
    }
  }, []);

  return (
    <div className="dl-auth-layout">
      <div className="dl-auth-card">
        <h1 className="dl-auth-title">Redirecting to Password Recovery</h1>
        <p className="dl-auth-desc">Password recovery is handled centrally via DevLab Portal...</p>
      </div>
    </div>
  );
}
