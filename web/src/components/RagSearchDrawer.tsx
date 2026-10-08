"use client";

import React, { useState } from "react";
import { Bot, Loader2, Search, Sparkles, X } from "lucide-react";
import type { RagEpisodeMatch } from "../lib/types";
import { API_BASE_URL, SAMPLE_RAG_QUERIES } from "../lib/constants";

interface RagSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Natural language semantic vector search drawer querying Ollama nomic-embed-text & HNSW.
 */
export const RagSearchDrawer: React.FC<RagSearchDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<RagEpisodeMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsQuerySearch(searchQuery);
  };

  const setIsQuerySearch = async (queryString: string) => {
    setQuery(queryString);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/logs/rag-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryString, limit: 5 }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = (await res.json()) as { matches: RagEpisodeMatch[] };
      setMatches(data.matches || []);
    } catch (err) {
      setError("Failed to execute semantic Log-RAG search. Ensure Ingest Service is active.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[620px] w-full max-w-2xl flex-col rounded-2xl border border-indigo-500/30 bg-slate-950 p-6 shadow-2xl shadow-indigo-500/10">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Semantic Log-RAG Retrieval</h2>
              <p className="text-xs text-slate-400">
                Vector HNSW search powered by nomic-embed-text (768 dims)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Ask anything: e.g. 'Why did the database connection time out?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            <span>Search</span>
          </button>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SAMPLE_RAG_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setIsQuerySearch(q)}
              className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results Stream Area */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
          {error && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          )}

          {matches.length === 0 && !isLoading && !error && (
            <div className="flex h-40 flex-col items-center justify-center text-center text-slate-500 text-xs">
              <Bot className="h-8 w-8 text-slate-700 mb-2" />
              <span>
                Enter a natural language inquiry or select a preset to search error traces.
              </span>
            </div>
          )}

          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-xs transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-400 border border-indigo-500/20">
                    {match.service}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(match.log_timestamp).toLocaleString()}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  {(match.similarity * 100).toFixed(1)}% Similarity
                </span>
              </div>
              <p className="mt-2 text-slate-200 font-mono text-[11px] leading-relaxed">
                {match.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
