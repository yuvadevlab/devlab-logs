"use client";

import React from "react";
import { Activity, Sparkles, Terminal, Wifi, WifiOff } from "lucide-react";

interface NavbarProps {
  isConnected: boolean;
  onOpenRag: () => void;
}

/**
 * Top navigation and telemetry control bar.
 */
export const Navbar: React.FC<NavbarProps> = ({ isConnected, onOpenRag }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand and Service Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">DevLab Telemetry</h1>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                Studio v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Distributed Multi-Stream Observability & Log-RAG</p>
          </div>
        </div>

        {/* Global Actions and Connection State */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRag}
            className="group flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/20 hover:border-indigo-400"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 transition-transform group-hover:rotate-12" />
            <span>AI Log-RAG Search</span>
            <kbd className="hidden rounded bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 sm:inline-block">
              /
            </kbd>
          </button>

          {/* Connection Status Indicator */}
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
              isConnected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Wifi className="h-3.5 w-3.5" />
                <span>Live Stream</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
