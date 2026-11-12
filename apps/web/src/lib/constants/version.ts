/**
 * @file apps/web/src/lib/constants/version.ts
 * @description Dynamic application version metadata resolved from package configuration or environment.
 * Implements Big Tech hybrid SemVer + Git SHA observability without hardcoded strings.
 * @module @devlab/logs-web/lib/constants/version
 */

import pkg from "../../../package.json";

const gitSha = process.env.NEXT_PUBLIC_GIT_SHA || process.env.GIT_SHA || "";
const baseVersion = `v${pkg.version}`;

/**
 * Canonical application version string (e.g. "v1.0.0" or "v1.0.0+a3f89c1").
 */
export const APP_VERSION: string =
  process.env.NEXT_PUBLIC_APP_VERSION ||
  (gitSha ? `${baseVersion}+${gitSha.slice(0, 7)}` : baseVersion);

/**
 * Immutable build and telemetry attribution metadata.
 */
export const BUILD_METADATA = {
  version: baseVersion,
  gitCommit: gitSha ? gitSha.slice(0, 7) : "dev-local",
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
  environment: process.env.NODE_ENV || "development",
} as const;
