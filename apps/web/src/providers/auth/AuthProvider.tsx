"use client";

import React from "react";
import { DevLabAuthProvider } from "@yuva-devlab/auth-client";

/**
 * Properties for the AuthProvider wrapper.
 */
export interface AuthProviderProps {
  /** Child component subtree requiring authentication context */
  readonly children: React.ReactNode;
}

/**
 * Client authentication provider wrapper for DevLab Logs.
 * Connects to DevLab Control Plane gateway and enforces real-time kill-switch status.
 *
 * @param props - Component properties containing children
 * @returns Context provider tree wrapped in DevLabAuthProvider
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const gatewayUrl = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_API_URL;
  const portalUrl = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL;

  if (!gatewayUrl || !portalUrl) {
    throw new Error(
      "NEXT_PUBLIC_DEVLAB_PORTAL_API_URL and NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL must be configured.",
    );
  }

  return (
    <DevLabAuthProvider appId="devlab-logs" gatewayUrl={gatewayUrl} portalUrl={portalUrl}>
      {children}
    </DevLabAuthProvider>
  );
}
