"use client";

import { useMemo, useState, useCallback } from "react";
import {
  RANGES,
  LogLevel,
  TimeRangeKey,
  Environment,
  type LogEvent,
  type ServiceName,
  type TimeWindow,
} from "../types";

export function useConsoleFilters(logs: LogEvent[], now: number) {
  const [env, setEnv] = useState<Environment>(Environment.PRODUCTION);
  const [autoScroll, setAutoScroll] = useState(true);
  const [range, setRange] = useState<TimeRangeKey>(TimeRangeKey.FIFTEEN_MINUTES);
  const [custom, setCustom] = useState<TimeWindow>({ from: "", to: "" });
  const [zoom, setZoom] = useState<[number, number] | null>(null);
  const [query, setQuery] = useState("");
  const [regex, setRegex] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceName[]>([]);
  const [levels, setLevels] = useState<LogLevel[]>([]);
  const [traceFilter, setTraceFilter] = useState("");
  const [isoTime, setIsoTime] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<LogEvent | null>(null);

  const regexPattern = useMemo(() => {
    if (!regex || !query) return null;
    try {
      return new RegExp(query, "i");
    } catch {
      return null;
    }
  }, [regex, query]);

  const windowRange: [number, number] = useMemo(() => {
    if (zoom) return zoom;
    if (range === TimeRangeKey.CUSTOM && custom.from && custom.to) {
      return [new Date(custom.from).getTime(), new Date(custom.to).getTime()];
    }
    const span =
      range === TimeRangeKey.CUSTOM ? RANGES[TimeRangeKey.FIFTEEN_MINUTES] : RANGES[range];
    return [now - span, now];
  }, [zoom, range, custom, now]);

  const baseFiltered = useMemo(() => {
    const [start, end] = windowRange;
    return logs.filter((l) => l.ts >= start && l.ts <= end);
  }, [logs, windowRange]);

  const filtered = useMemo(() => {
    return baseFiltered.filter((l) => {
      if (services.length && !services.includes(l.service)) return false;
      if (levels.length && !levels.includes(l.level)) return false;
      if (traceFilter && !l.traceId.toLowerCase().includes(traceFilter.toLowerCase())) return false;
      if (query) {
        if (regexPattern) {
          if (!regexPattern.test(l.message)) return false;
        } else {
          const q = query.toLowerCase();
          const matches =
            l.message.toLowerCase().includes(q) ||
            l.service.toLowerCase().includes(q) ||
            l.traceId.toLowerCase().includes(q);
          if (!matches) return false;
        }
      }
      return true;
    });
  }, [baseFiltered, services, levels, traceFilter, query, regexPattern]);

  const levelCounts = useMemo(() => {
    const c: Record<LogLevel, number> = {
      [LogLevel.FATAL]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.DEBUG]: 0,
    };
    baseFiltered.forEach((l) => c[l.level]++);
    return c;
  }, [baseFiltered]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setServices([]);
    setLevels([]);
    setTraceFilter("");
    setZoom(null);
  }, []);

  const commitSearch = () => {
    if (!query) return;
    setHistory((prev) => [query, ...prev.filter((x) => x !== query)].slice(0, 8));
  };

  return {
    env,
    setEnv,
    autoScroll,
    setAutoScroll,
    range,
    setRange,
    custom,
    setCustom,
    zoom,
    setZoom,
    query,
    setQuery,
    regex,
    setRegex,
    history,
    services,
    setServices,
    levels,
    setLevels,
    traceFilter,
    setTraceFilter,
    isoTime,
    setIsoTime,
    expanded,
    setExpanded,
    selected,
    setSelected,
    regexPattern,
    windowRange,
    baseFiltered,
    filtered,
    levelCounts,
    clearFilters,
    commitSearch,
  };
}
