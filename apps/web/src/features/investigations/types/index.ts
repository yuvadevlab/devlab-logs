/**
 * @file apps/web/src/features/investigations/types/index.ts
 * @description Frontend TypeScript types for persistent AI Incident Investigations.
 * @module @devlab/logs-web/features/investigations/types
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

export interface InvestigationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: LogCitation[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface InvestigationConversation {
  id: string;
  tenant_id: string | null;
  user_id: string;
  title: string;
  summary: string | null;
  pinned: boolean;
  message_count?: number;
  created_at: string;
  updated_at: string;
  messages?: InvestigationMessage[];
}

export interface GroupedInvestigations {
  today: InvestigationConversation[];
  yesterday: InvestigationConversation[];
  previous7Days: InvestigationConversation[];
  older: InvestigationConversation[];
}
