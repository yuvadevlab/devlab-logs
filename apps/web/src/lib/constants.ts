/**
 * @file apps/web/src/lib/constants.ts
 * @description Global configuration constants and environmental endpoints.
 * @module @devlab/logs-web/constants
 */

import { API_ROUTES } from "./constants/routes";

export * from "./constants/enums";
export * from "./constants/routes";
export * from "./constants/regex";

export function getApiBaseUrl(): string {
  const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!configuredApiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured for the Logs Console.");
  }
  return configuredApiBaseUrl;
}

export function getWebSocketStreamUrl(): string {
  return getApiBaseUrl().replace(/^http/, "ws") + API_ROUTES.WS_STREAM;
}
