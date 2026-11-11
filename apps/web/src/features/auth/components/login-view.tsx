/**
 * @file apps/web/src/features/auth/components/login-view.tsx
 * @description Client view for DevLab Logs authentication delegating to DevLab Portal Central SSO.
 * Modeled after FinAI's authentication handoff pattern.
 * @module @devlab/logs-web/features/auth
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { SpinnerIcon } from "@devlab-logs/ui";
import { LogsStorageKey, LogsCookieKey } from "@/lib/constants/enums";
import { DEVLAB_PORTAL_ROUTES } from "@/lib/constants/routes";

/**
 * Client view for DevLab Logs authentication.
 * Automatically purges stale session markers and delegates to DevLab Portal Central SSO.
 */
export function LoginView(): React.JSX.Element {
  const purgeAndRedirect = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LogsStorageKey.TOKEN);
      localStorage.removeItem(LogsStorageKey.USER);
      localStorage.removeItem(LogsStorageKey.ACCESS_TOKEN);
      localStorage.removeItem(LogsStorageKey.AUTH_TOKEN);
      localStorage.removeItem(LogsStorageKey.AUTH_USER);
      document.cookie = `${LogsCookieKey.TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${LogsCookieKey.ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      window.location.href = DEVLAB_PORTAL_ROUTES.LOGIN(window.location.origin);
    }
  }, []);

  useEffect(() => {
    purgeAndRedirect();
  }, [purgeAndRedirect]);

  return (
    <div className="dl-auth-layout">
      <div className="dl-auth-card">
        <div className="dl-auth-icon-wrap">
          <SpinnerIcon className="dl-spinner dl-spinner--lg" />
        </div>

        <h1 className="dl-auth-title">Redirecting to DevLab SSO</h1>
        <p className="dl-auth-desc">
          Single Sign-On is required to access DevLab Logs. You are being redirected to the DevLab
          Portal...
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" onClick={purgeAndRedirect} className="dl-auth-btn">
            Continue to DevLab Portal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
