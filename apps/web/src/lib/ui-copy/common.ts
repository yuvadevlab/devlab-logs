/**
 * @file apps/web/src/lib/ui-copy/common.ts
 * @description Universal brand, navigation, ecosystem, and core action copy catalogs.
 * @module @devlab/logs-web/lib/ui-copy/common
 */

export const COMMON_COPY = {
  BRAND: "DevLab Logs",
  TELEMETRY_TAGLINE: "telemetry · kafka · duckdb",
  LOADING: "Loading…",
  NAVIGATION: {
    LIVE_EXPLORER: "Live Explorer",
    AI_INVESTIGATOR: "AI Investigator",
    RAG_BADGE: "RAG",
    WORKSPACE_VIEWS: "Workspace Views",
  },
  ECOSYSTEM: {
    TITLE: "DevLab Ecosystem Applications",
    SECTION_VIEWS: "Workspace Views",
    SECTION_APPS: "DevLab Ecosystem",
  },
  ACTIONS: {
    APPLY_RANGE: "Apply range",
    ASK_AI: "Ask AI",
    CLEAR: "Clear",
    CLEAR_LOGS: "Clear logs",
    COPY_JSON: "Copy JSON",
    INVESTIGATE: "Investigate",
    JUMP_TO_LIVE: "Jump to live",
    PAUSE: "Pause",
    PAUSE_STREAM: "Pause live streaming",
    RESUME: "Resume",
    RESUME_STREAM: "Resume live streaming",
    SQL: "SQL",
    COPILOT: "Copilot",
    OPEN_SQL: "Open SQL workbench",
    OPEN_COPILOT: "Open AI Copilot",
    AUTO_SCROLL: "Auto-scroll",
    COMMAND_PALETTE: "⌘K",
    SEARCH_AND_COMMANDS: "Search and commands (⌘K)",
  },
  ENVIRONMENT: {
    PRODUCTION: "● production",
    STAGING: "● staging",
    DEVELOPMENT: "● local-dev",
  },
} as const;
