/**
 * @file apps/web/src/features/investigations/hooks/useInvestigationSession.ts
 * @description State hook managing conversation turns, zero-latency caching, and API mutations.
 * Fully compliant with React 19 reactivity rules without synchronous effect setState calls.
 * @module @devlab/logs-web/features/investigations/hooks/useInvestigationSession
 */

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import type { InvestigationMessage } from "../types";
import {
  useInvestigationsQuery,
  useInvestigationThreadQuery,
  useCreateInvestigationMutation,
  useSendMessageMutation,
  loadCachedMessages,
  saveCachedMessages,
} from "../api";

export function useInvestigationSession(initialConversationId?: string) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | undefined>(initialConversationId);
  const [input, setInput] = useState("");
  const [pendingMessages, setPendingMessages] = useState<InvestigationMessage[]>([]);

  const { data: conversations = [], isLoading: isLoadingList } = useInvestigationsQuery();
  const { data: currentThread, isLoading: isLoadingThread } = useInvestigationThreadQuery(activeId);

  const createMutation = useCreateInvestigationMutation();
  const sendMutation = useSendMessageMutation();

  // Pure derived message array merging server state, session cache, and optimistic items
  const messages = useMemo(() => {
    let base: InvestigationMessage[] = [];
    if (currentThread?.messages && currentThread.messages.length > 0) {
      base = currentThread.messages;
      if (activeId) saveCachedMessages(activeId, currentThread.messages);
    } else if (activeId) {
      base = loadCachedMessages(activeId) ?? [];
    }

    if (pendingMessages.length === 0) return base;
    return [...base, ...pendingMessages];
  }, [currentThread?.messages, activeId, pendingMessages]);

  const selectConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      setPendingMessages([]);
      router.push(APP_ROUTES.INVESTIGATE(id));
    },
    [router],
  );

  const startNewChat = useCallback(() => {
    setActiveId(undefined);
    setPendingMessages([]);
    router.push(APP_ROUTES.INVESTIGATE());
  }, [router]);

  const handleSendMessage = useCallback(
    async (contentToSend?: string) => {
      const text = (contentToSend ?? input).trim();
      if (!text || sendMutation.isPending || createMutation.isPending) return;
      setInput("");

      const optimisticUser: InvestigationMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: activeId ?? "",
        role: "user",
        content: text,
        citations: [],
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setPendingMessages([optimisticUser]);

      try {
        if (!activeId) {
          const title = text.length > 50 ? `${text.slice(0, 47)}…` : text;
          const created = await createMutation.mutateAsync({ title, initialQuery: text });
          setActiveId(created.id);
          setPendingMessages([]);
          router.push(APP_ROUTES.INVESTIGATE(created.id));
        } else {
          await sendMutation.mutateAsync({ conversationId: activeId, content: text });
          setPendingMessages([]);
        }
      } catch {
        setPendingMessages([]);
      }
    },
    [input, activeId, sendMutation, createMutation, router],
  );

  return {
    activeId,
    conversations,
    isLoadingList,
    isLoadingThread,
    messages,
    input,
    setInput,
    isSubmitting: sendMutation.isPending || createMutation.isPending,
    selectConversation,
    startNewChat,
    handleSendMessage,
  };
}
