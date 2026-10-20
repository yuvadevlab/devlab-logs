import { AUTH_COPY } from "./auth";
import { COMMON_COPY } from "./common";
import { LOGS_COPY } from "./logs";

export * from "./auth";
export * from "./common";
export * from "./logs";

export const UI_COPY = {
  AUTH: AUTH_COPY,
  COMMON: COMMON_COPY,
  LOGS: LOGS_COPY,
} as const;

export type UiCopyCatalog = typeof UI_COPY;
