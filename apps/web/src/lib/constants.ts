/**
 * Global configuration constants, endpoints, and style tokens for DevLab Studio.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

export const WS_STREAM_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3020/stream";

export const SERVICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  finai: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  orchestrai: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
  },
  portal: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  guard: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
};

export const LEVEL_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  info: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    dot: "bg-sky-400",
  },
  warn: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  error: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-500",
  },
};

export const SAMPLE_RAG_QUERIES = [
  "Why did the database connection time out?",
  "Show tenant quota warnings or rate limit exceedances",
  "Are there any authentication or JWT token verification errors?",
  "Which service threw a fatal checkpoint commit failure?",
];
