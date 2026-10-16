"use client";

/**
 * TanStack Mutation encapsulation for Log-RAG semantic search.
 * Connects directly to DevLab Ingestion Gateway's vector similarity search.
 */

import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL, API_ROUTES } from "@/lib/constants";
import type { LogEpisodeMatch, RagSearchResponse } from "../types";

export interface RagSearchPayload {
  query: string;
  limit?: number;
}

export type { LogEpisodeMatch, RagSearchResponse as RagSearchResult };

/**
 * Executes a semantic nearest-neighbor search against the Ollama log embeddings.
 */
export async function executeRagSearch(payload: RagSearchPayload): Promise<RagSearchResponse> {
  const res = await fetch(`${API_BASE_URL}${API_ROUTES.RAG_SEARCH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`RAG search failed: ${res.statusText}`);
  }

  return (await res.json()) as RagSearchResponse;
}

/**
 * Custom mutation hook for semantic Log-RAG investigations.
 */
export function useRagSearchMutation() {
  return useMutation({
    mutationFn: executeRagSearch,
  });
}
