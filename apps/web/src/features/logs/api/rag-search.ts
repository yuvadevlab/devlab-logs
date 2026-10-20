"use client";

/**
 * TanStack Mutation encapsulation for Log-RAG semantic search.
 * Connects directly to DevLab Ingestion Gateway's vector similarity search.
 */

import { useMutation } from "@tanstack/react-query";
import { useDevLabAuth } from "@yuva-devlab/auth-client";
import { API_ROUTES, getApiBaseUrl } from "@/lib/constants";
import type { LogEpisodeMatch, RagSearchResponse } from "../types";

export interface RagSearchPayload {
  query: string;
  limit?: number;
}

export type { LogEpisodeMatch, RagSearchResponse as RagSearchResult };

/**
 * Executes a semantic nearest-neighbor search against the Ollama log embeddings.
 */
export async function executeRagSearch(
  payload: RagSearchPayload,
  token: string,
): Promise<RagSearchResponse> {
  const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.RAG_SEARCH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
  const { token } = useDevLabAuth();
  return useMutation({
    mutationFn: (payload: RagSearchPayload) => {
      if (!token) throw new Error("Authentication is required to search logs.");
      return executeRagSearch(payload, token);
    },
  });
}
