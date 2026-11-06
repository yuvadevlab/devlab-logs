/**
 * @file apps/web/src/features/investigations/api/investigations-api.ts
 * @description React Query hooks and HTTP client bindings for AI Incident Investigations.
 * Interacts directly with the Ingestion Gateway API.
 * @module @devlab/logs-web/features/investigations/api/investigations-api
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDevLabAuth } from "@yuva-devlab/auth-client";
import { API_ROUTES, getApiBaseUrl } from "@/lib/constants";
import type { InvestigationConversation, InvestigationMessage } from "../types";

export const investigationKeys = {
  all: ["investigations"] as const,
  list: (userId?: string) => ["investigations", "list", userId] as const,
  thread: (id?: string) => ["investigations", "thread", id] as const,
};

/**
 * Lists all investigation conversations for the current authenticated user.
 */
export function useInvestigationsQuery() {
  const { token, user } = useDevLabAuth();
  return useQuery({
    queryKey: investigationKeys.list(user?.id),
    queryFn: async (): Promise<InvestigationConversation[]> => {
      if (!token) return [];
      const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.INVESTIGATIONS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch investigations");
      const data = await res.json();
      return data.conversations ?? [];
    },
    enabled: Boolean(token),
  });
}

/**
 * Hydrates an individual investigation conversation with full message turns.
 */
export function useInvestigationThreadQuery(conversationId?: string) {
  const { token } = useDevLabAuth();
  return useQuery({
    queryKey: investigationKeys.thread(conversationId),
    queryFn: async (): Promise<InvestigationConversation | null> => {
      if (!token || !conversationId) return null;
      const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.INVESTIGATIONS}/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load investigation thread");
      const data = await res.json();
      return data.conversation ?? null;
    },
    enabled: Boolean(token && conversationId),
  });
}

/**
 * Mutation hook to create a new investigation conversation thread.
 */
export function useCreateInvestigationMutation() {
  const { token } = useDevLabAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      initialQuery,
    }: {
      title: string;
      initialQuery?: string;
    }): Promise<InvestigationConversation> => {
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.INVESTIGATIONS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, initialQuery }),
      });
      if (!res.ok) throw new Error("Failed to create investigation");
      const data = await res.json();
      return data.conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.all });
    },
  });
}

/**
 * Mutation hook to update an existing conversation title.
 */
export function useUpdateInvestigationTitleMutation() {
  const { token } = useDevLabAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.INVESTIGATIONS}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update thread");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.all });
      queryClient.invalidateQueries({ queryKey: investigationKeys.thread(vars.id) });
    },
  });
}

/**
 * Mutation hook to delete a conversation thread.
 */
export function useDeleteInvestigationMutation() {
  const { token } = useDevLabAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.INVESTIGATIONS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete thread");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.all });
    },
  });
}

/**
 * Mutation hook to append a user message and retrieve the AI assistant response.
 */
export function useSendMessageMutation() {
  const { token } = useDevLabAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }): Promise<{
      userMessage: InvestigationMessage;
      assistantMessage: InvestigationMessage;
    }> => {
      if (!token) throw new Error("Authentication required");
      const res = await fetch(
        `${getApiBaseUrl()}${API_ROUTES.INVESTIGATION_MESSAGES(conversationId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        },
      );
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: investigationKeys.thread(vars.conversationId) });
      queryClient.invalidateQueries({ queryKey: investigationKeys.all });
    },
  });
}
