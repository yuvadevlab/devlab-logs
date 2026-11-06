/**
 * @file apps/web/src/features/investigations/api/chatStorage.ts
 * @description In-memory and sessionStorage persistence adapter for investigation threads.
 * Enables zero-latency instant thread switching without UI jitter or skeleton flashing,
 * matching the architecture pattern established in FinAI and OrchestrAI.
 * @module @devlab/logs-web/features/investigations/api/chatStorage
 */

import type { InvestigationMessage } from "../types";

const CHAT_CACHE_PREFIX = "devlab_investigation_thread_";

/**
 * Loads cached conversation messages from browser sessionStorage.
 */
export function loadCachedMessages(conversationId: string): InvestigationMessage[] | null {
  if (typeof window === "undefined" || !conversationId) return null;
  try {
    const raw = sessionStorage.getItem(`${CHAT_CACHE_PREFIX}${conversationId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as InvestigationMessage[]) : null;
  } catch {
    return null;
  }
}

/**
 * Persists conversation messages to browser sessionStorage for instant retrieval.
 */
export function saveCachedMessages(conversationId: string, messages: InvestigationMessage[]): void {
  if (typeof window === "undefined" || !conversationId || messages.length === 0) return;
  try {
    sessionStorage.setItem(`${CHAT_CACHE_PREFIX}${conversationId}`, JSON.stringify(messages));
  } catch {
    // Graceful fallback when sessionStorage is constrained
  }
}

/**
 * Removes cached conversation messages from sessionStorage when deleted.
 */
export function removeCachedMessages(conversationId: string): void {
  if (typeof window === "undefined" || !conversationId) return;
  try {
    sessionStorage.removeItem(`${CHAT_CACHE_PREFIX}${conversationId}`);
  } catch {
    // Graceful fallback
  }
}
