/**
 * @file apps/web/src/lib/constants.ts
 * @description Global configuration constants and environmental endpoints.
 * @module @devlab/logs-web/constants
 */

import { API_ROUTES } from "./constants/routes";

export * from "./constants/enums";
export * from "./constants/routes";
export * from "./constants/regex";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
if (!configuredApiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured for the Logs Console.");
}

export const API_BASE_URL = configuredApiBaseUrl;

export const WS_STREAM_URL = API_BASE_URL.replace(/^http/, "ws") + API_ROUTES.WS_STREAM;
