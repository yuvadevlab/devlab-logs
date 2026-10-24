/**
 * @file apps/web/src/app/(auth)/layout.tsx
 * @description Pure SSR server layout wrapper for authentication routes.
 * @module @devlab/logs-web/app/(auth)
 */

import React from "react";

/**
 * Properties for the SSR authentication layout wrapper.
 */
export interface AuthLayoutProps {
  /** Child view component to render inside the auth container */
  readonly children: React.ReactNode;
}

/**
 * Pure Server Component rendering centered DevLab Logs branded authentication backdrop.
 *
 * @param props - Layout props containing children
 * @returns Server-rendered layout element
 */
export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return <>{children}</>;
}
