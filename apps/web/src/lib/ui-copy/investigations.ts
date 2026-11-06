/**
 * @file apps/web/src/lib/ui-copy/investigations.ts
 * @description Centralized UI copy dictionary for AI Incident Investigations.
 * @module @devlab/logs-web/ui-copy/investigations
 */

export const INVESTIGATION_COPY = {
  TITLE: "AI Incident Investigator",
  SUBTITLE: "Semantic Log-RAG forensic analysis & automated root-cause diagnosis",
  NEW_INVESTIGATION: "New Investigation",
  SEARCH_THREADS: "Search investigations…",
  NO_THREADS: "No past investigations found.",
  GROUPS: {
    TODAY: "Today",
    YESTERDAY: "Yesterday",
    PREVIOUS_7_DAYS: "Previous 7 Days",
    OLDER: "Older",
  },
  ACTIONS: {
    NEW_CHAT: "New Chat",
    HISTORY: "History",
    DELETE_THREAD: "Delete Thread",
    RENAME_THREAD: "Rename Thread",
    SEND: "Investigate",
    STOP: "Stop",
    JUMP_TO_LATEST: "Jump to latest",
    VIEW_IN_EXPLORER: "Open in Log Explorer",
  },
  COMPOSER: {
    PLACEHOLDER: "Ask a question about system errors, trace latency spikes, or incident patterns…",
    HINT: "Press Enter to submit, Shift + Enter for new line",
  },
  EMPTY_STATE: {
    HEADING: "Investigate System Incidents with Log-RAG",
    DESCRIPTION:
      "Ask natural-language questions to cross-reference pgvector embeddings, isolate service anomalies, and uncover root causes.",
    PROMPTS: [
      "Investigate sudden spike in 500 error traces across microservices",
      "Analyze timeout bottlenecks in finai-api database connections",
      "Summarize fatal incidents and unhandled exceptions in the last 24 hours",
      "Correlate gateway latency degradation with downstream worker load",
    ],
  },
  CITATIONS: {
    TITLE: "Correlated Telemetry Episodes",
    MATCH: "% match",
    VIEW_LOG: "View Log",
    TRACE: "Trace",
  },
  NOTIFICATIONS: {
    THREAD_CREATED: "New investigation thread started",
    THREAD_DELETED: "Investigation thread deleted",
    THREAD_RENAMED: "Thread title updated",
    ERROR_SENDING: "Failed to send investigation message",
  },
} as const;
