/**
 * @file apps/web/src/lib/constants.ts
 * @description Global configuration constants and environmental endpoints.
 * @module @devlab/logs-web/constants
 */

import { API_ROUTES } from "./constants/routes";

export * from "./constants/enums";
export * from "./constants/routes";
export * from "./constants/regex";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

export const WS_STREAM_URL =
  process.env.NEXT_PUBLIC_WS_URL || API_BASE_URL.replace(/^http/, "ws") + API_ROUTES.WS_STREAM;
