/**
 * @file apps/web/src/lib/constants/routes.ts
 * @description Centralized catalog of client routes and backend API endpoints.
 * Eliminates ad-hoc URL strings and provides type-safe path generators.
 * @module @devlab/logs-web/constants/routes
 */

/** Client-side URL routes */
export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

/** Backend REST and WebSocket API routes */
export const API_ROUTES = {
  LOGS: "/api/v1/logs",
  LOGS_BATCH: "/api/v1/logs/batch",
  RAG_SEARCH: "/api/v1/logs/rag-search",
  HEALTH: "/health",
  WS_STREAM: "/stream",
  AUTH_LOGIN: "/auth/login",
  AUTH_RESET_PASSWORD: "/auth/reset-password",
  PLATFORM_APP_STATUS: (appId: string) => `/api/v1/platform/apps/${appId}/status`,
} as const;
