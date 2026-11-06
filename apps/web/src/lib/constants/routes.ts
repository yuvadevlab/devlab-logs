/**
 * @file apps/web/src/lib/constants/routes.ts
 * @description Centralized catalog of client routes and backend API endpoints.
 * Eliminates ad-hoc URL strings and provides type-safe path generators.
 * @module @devlab/logs-web/constants/routes
 */

/** Client-side URL routes */
export const APP_ROUTES = {
  HOME: "/",
  INVESTIGATE: (id?: string) => (id ? `/investigate/${id}` : "/investigate"),
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

/** DevLab Central Portal SSO route builders and canonical destinations */
const PORTAL_WEB_URL = process.env.NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL || "http://localhost:3000";
const APP_ID = "devlab-logs";

export const DEVLAB_PORTAL_ROUTES = {
  LOGIN: (redirectUrl?: string) => {
    const base = `${PORTAL_WEB_URL}/login?app=${encodeURIComponent(APP_ID)}`;
    return redirectUrl ? `${base}&redirect=${encodeURIComponent(redirectUrl)}` : base;
  },
  REGISTER: () => `${PORTAL_WEB_URL}/register?app=${encodeURIComponent(APP_ID)}`,
  FORGOT_PASSWORD: () => `${PORTAL_WEB_URL}/forgot-password?app=${encodeURIComponent(APP_ID)}`,
  RESET_PASSWORD: () => `${PORTAL_WEB_URL}/reset-password?app=${encodeURIComponent(APP_ID)}`,
} as const;

/** Backend REST and WebSocket API routes */
export const API_ROUTES = {
  LOGS: "/api/v1/logs",
  LOGS_BATCH: "/api/v1/logs/batch",
  RAG_SEARCH: "/api/v1/logs/rag-search",
  INVESTIGATIONS: "/api/v1/investigations",
  INVESTIGATION_MESSAGES: (id: string) => `/api/v1/investigations/${id}/messages`,
  STREAM_TICKET: "/api/v1/logs/stream-ticket",
  HEALTH: "/health",
  WS_STREAM: "/stream",
  AUTH_LOGIN: "/auth/login",
  AUTH_RESET_PASSWORD: "/auth/reset-password",
  PLATFORM_APP_STATUS: (appId: string) => `/api/v1/platform/apps/${appId}/status`,
} as const;
