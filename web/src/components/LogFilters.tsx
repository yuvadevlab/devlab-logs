"use client";

import React from "react";
import { Filter, Pause, Play, RotateCcw, Search } from "lucide-react";
import type { LogFilterState } from "../lib/types";

interface LogFiltersProps {
  filters: LogFilterState;
  onFilterChange: (filters: LogFilterState) => void;
  isAutoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClearLogs: () => void;
}

/**
 * Filter and waterfall stream control toolbar.
 */
export const LogFilters: React.FC<LogFiltersProps> = ({
  filters,
  onFilterChange,
  isAutoScroll,
  onToggleAutoScroll,
  onClearLogs,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
      {/* Search Input and Selectors */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter message or trace..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Service Selector */}
        <select
          value={filters.service}
          aria-label="Filter by service"
          onChange={(e) => onFilterChange({ ...filters, service: e.target.value })}
          className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Services</option>
          <option value="finai">finai</option>
          <option value="orchestrai">orchestrai</option>
          <option value="portal">portal</option>
          <option value="guard">guard</option>
        </select>

        {/* Log Level Selector */}
        <div className="flex rounded-lg border border-slate-800 bg-slate-950/80 p-0.5">
          {["all", "info", "warn", "error"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => onFilterChange({ ...filters, level: lvl })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                filters.level === lvl
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAutoScroll}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            isAutoScroll
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          {isAutoScroll ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isAutoScroll ? "Pause Stream" : "Resume Auto-Scroll"}</span>
        </button>

        <button
          onClick={onClearLogs}
          title="Clear Buffer"
          className="rounded-lg border border-slate-800 bg-slate-950/80 p-2 text-slate-400 hover:text-slate-200 hover:border-slate-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
