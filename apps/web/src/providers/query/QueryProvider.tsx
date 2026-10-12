"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates an isolated QueryClient instance configured for low-latency telemetry caching.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Retrieves the singleton browser QueryClient or instantiates a fresh server QueryClient.
 */
function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server execution: always instantiate fresh query client
    return makeQueryClient();
  }
  // Browser execution: reuse singleton across hydration cycles
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Top-level TanStack Query Provider wrapper.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
