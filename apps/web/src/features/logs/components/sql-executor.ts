/**
 * In-memory SQL execution engine and syntax highlighting for DuckDB workbench.
 * Enforces centralized regex invariants and strict LogLevel enum comparisons.
 */

import { REGEX } from "@/lib/constants";
import { fmtIso } from "@/lib/logs";
import { LogLevel, SERVICES, type LogEvent } from "../types";

export interface SqlTemplate {
  id: string;
  name: string;
  sql: string;
}

export const SQL_TEMPLATES: SqlTemplate[] = [
  {
    id: "errors",
    name: "Top error signatures",
    sql: "SELECT service, regexp_replace(message, '\\d+', 'N') AS signature,\n       count(*) AS hits, avg(latency_ms) AS avg_ms\nFROM logs\nWHERE level IN ('ERROR', 'FATAL')\nGROUP BY 1, 2\nORDER BY hits DESC\nLIMIT 20;",
  },
  {
    id: "p95",
    name: "Latency p50 / p95 by service",
    sql: "SELECT service, count(*) AS events,\n       quantile_cont(latency_ms, 0.50) AS p50,\n       quantile_cont(latency_ms, 0.95) AS p95,\n       max(latency_ms) AS max_ms\nFROM logs\nGROUP BY 1\nORDER BY p95 DESC;",
  },
  {
    id: "minute",
    name: "Error count per minute",
    sql: "SELECT date_trunc('minute', ts) AS minute,\n       count(*) FILTER (WHERE level = 'ERROR') AS errors,\n       count(*) FILTER (WHERE level = 'FATAL') AS fatals,\n       count(*) AS total\nFROM logs\nGROUP BY 1\nORDER BY 1 DESC;",
  },
];

/**
 * Highlights SQL syntax using centralized design tokens and regex patterns.
 */
export function highlightSql(sql: string): string {
  const esc = sql.replace(REGEX.HTML_AMP, "&amp;").replace(REGEX.HTML_LT, "&lt;");
  return esc
    .replace(REGEX.SQL_STRINGS, '<span class="text-syn-str">$1</span>')
    .replace(REGEX.SQL_NUMBERS, '<span class="text-syn-num">$1</span>')
    .replace(REGEX.SQL_KEYWORDS, (m) => `<span class="text-syn-key font-semibold">${m}</span>`);
}

const quant = (arr: number[], p: number) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? 0;
};

/**
 * Executes a vectorized query simulation over real in-memory buffered logs.
 */
export function executeQuery(sql: string, logs: LogEvent[]): Record<string, string | number>[] {
  const s = sql.toLowerCase();

  // Latency percentile aggregation query
  if (s.includes("quantile") || s.includes("p95")) {
    return SERVICES.map((svc) => {
      const l = logs.filter((x) => x.service === svc).map((x) => x.latency);
      return {
        service: svc,
        events: l.length,
        p50: quant(l, 0.5),
        p95: quant(l, 0.95),
        max_ms: Math.max(0, ...l),
      };
    });
  }

  // Minute-by-minute timeline aggregation query
  if (s.includes("minute")) {
    const m = new Map<number, { errors: number; fatals: number; total: number }>();
    logs.forEach((l) => {
      const k = Math.floor(l.ts / 60000) * 60000;
      const r = m.get(k) ?? { errors: 0, fatals: 0, total: 0 };
      r.total++;
      if (l.level === LogLevel.ERROR) r.errors++;
      if (l.level === LogLevel.FATAL) r.fatals++;
      m.set(k, r);
    });
    return [...m.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([k, v]) => ({ minute: fmtIso(k).slice(0, 16), ...v }));
  }

  // Error signature aggregation query
  const m = new Map<string, { service: string; signature: string; hits: number; tot: number }>();
  logs
    .filter((l) => l.level === LogLevel.ERROR || l.level === LogLevel.FATAL)
    .forEach((l) => {
      const sig = l.message.replace(REGEX.DIGITS, "N");
      const k = l.service + sig;
      const r = m.get(k) ?? { service: l.service, signature: sig, hits: 0, tot: 0 };
      r.hits++;
      r.tot += l.latency;
      m.set(k, r);
    });

  return [...m.values()]
    .sort((a, b) => b.hits - a.hits)
    .slice(20)
    .map((r) => ({
      service: r.service,
      signature: r.signature,
      hits: r.hits,
      avg_ms: Math.round(r.tot / r.hits),
    }));
}
