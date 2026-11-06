/**
 * @file apps/ingest/src/investigations/types.ts
 * @description Type definitions and Zod validation schemas for AI Incident Investigation sessions.
 * Enforces canonical schemas and strict PostgreSQL snake_case conventions.
 * @module @devlab/logs-ingest/investigations/types
 */

import { z } from "zod";

/**
 * Validation schema for initiating a new investigation conversation.
 */
export const CreateInvestigationSchema = z.object({
  title: z.string().min(1).max(255),
  initialQuery: z.string().max(2000).optional(),
});

export type CreateInvestigationInput = z.infer<typeof CreateInvestigationSchema>;

/**
 * Validation schema for updating conversation metadata.
 */
export const UpdateInvestigationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  pinned: z.boolean().optional(),
});

export type UpdateInvestigationInput = z.infer<typeof UpdateInvestigationSchema>;

/**
 * Validation schema for posting a new user message within an investigation thread.
 */
export const CreateMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;

/**
 * Structured citation referencing an actual telemetry log episode.
 */
export interface LogCitation {
  log_id?: string;
  service: string;
  level?: string;
  trace_id?: string;
  timestamp: string;
  summary: string;
  similarity: number;
}

/**
 * Raw database record representing an investigation conversation thread.
 */
export interface InvestigationRecord {
  id: string;
  tenant_id: string | null;
  user_id: string;
  title: string;
  summary: string | null;
  pinned: boolean;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Raw database record representing an individual message turn.
 */
export interface InvestigationMessageRecord {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: LogCitation[];
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Hydrated conversation thread including all chronological messages.
 */
export interface HydratedInvestigation extends InvestigationRecord {
  messages: InvestigationMessageRecord[];
}
