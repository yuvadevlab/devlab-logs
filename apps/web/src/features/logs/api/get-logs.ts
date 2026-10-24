"use client";

/**
 * TanStack Query encapsulation for historical telemetry log queries.
 * Integrates directly with DevLab Ingest Gateway API.
 */

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { useDevLabAuth } from "@yuva-devlab/auth-client";
import { API_ROUTES, getApiBaseUrl } from "@/lib/constants";
import { normalizeBackendLog } from "@/lib/logs";
import type { LogEvent } from "../types";

export interface GetLogsParams {
  limit?: number;
  offset?: number;
  service?: string;
  level?: string;
  traceId?: string;
  tenantId?: string;
  search?: string;
}

export const logsQueryKeys = {
  all: ["logs"] as const,
  historical: (params?: GetLogsParams, userId?: string) =>
    ["logs", "historical", userId, params] as const,
};

/**
 * Fetches real historical telemetry logs from DevLab Ingest Gateway API.
 */
export async function getHistoricalLogs(
  token: string,
  params: GetLogsParams = { limit: 1000 },
): Promise<LogEvent[]> {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  if (params.service) query.set("service", params.service);
  if (params.level) query.set("level", params.level);
  if (params.traceId) query.set("traceId", params.traceId);
  if (params.tenantId) query.set("tenantId", params.tenantId);
  if (params.search) query.set("search", params.search);

  const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.LOGS}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.statusText}`);
  }

  const data = (await res.json()) as { logs?: Record<string, unknown>[] };
  if (!data.logs || data.logs.length === 0) {
    return [];
  }

  return data.logs.map((raw) => normalizeBackendLog(raw));
}

/**
 * Custom hook consuming encapsulated historical logs server state.
 */
export function useLogsQuery(params?: GetLogsParams) {
  const { token, user } = useDevLabAuth();
  return useQuery({
    queryKey: logsQueryKeys.historical(params, user?.id),
    queryFn: () => {
      if (!token) throw new Error("Authentication is required to read logs.");
      return getHistoricalLogs(token, params);
    },
    enabled: Boolean(token),
    staleTime: 30 * 1000,
  });
}

/**
 * SSR Prefetch helper for Next.js Server Components.
 */
export async function prefetchHistoricalLogs(
  queryClient: QueryClient,
  token: string,
  userId: string,
  params?: GetLogsParams,
) {
  await queryClient.prefetchQuery({
    queryKey: logsQueryKeys.historical(params, userId),
    queryFn: () => getHistoricalLogs(token, params),
  });
}
