/**
 * @file apps/web/src/lib/constants/enums.ts
 * @description Canonical domain enums for DevLab Telemetry & Log Analytics.
 * Enforces zero raw hardcoded strings across UI components, state machines, and API interactions.
 * @module @devlab/logs-web/constants/enums
 */

/** Telemetry severity levels matching distributed tracing standards */
export enum LogLevel {
  FATAL = "FATAL",
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

/** Microservices registered across the DevLab ecosystem */
export enum ServiceName {
  API_GATEWAY = "api-gateway",
  AUTH_SERVICE = "auth-service",
  PAYMENT_ENGINE = "payment-engine",
  FINAI_WORKER = "finai-worker",
  ORCHESTRAI_SWARM = "orchestrai-swarm",
  COLLECTOR_DAEMON = "collector-daemon",
}

/** WebSocket real-time streaming lifecycle state */
export enum StreamState {
  LIVE = "live",
  PAUSED = "paused",
  RECONNECTING = "reconnecting",
  DISCONNECTED = "disconnected",
}

/** Time window ranges for telemetry filtering */
export enum TimeRangeKey {
  FIVE_MINUTES = "5m",
  FIFTEEN_MINUTES = "15m",
  ONE_HOUR = "1h",
  TWENTY_FOUR_HOURS = "24h",
  CUSTOM = "custom",
}

/** Deployment environments */
export enum Environment {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
}

/** Telemetry export file formats */
export enum ExportFormat {
  JSONL = "jsonl",
  PARQUET = "parquet",
  CSV = "csv",
}

/** AI Investigation processing phases */
export enum AiAnalysisPhase {
  IDLE = "idle",
  THINKING = "thinking",
  DONE = "done",
  ERROR = "error",
}
