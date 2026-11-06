/**
 * @file apps/ingest/src/investigations/investigation_service.ts
 * @description Orchestrates AI-powered Log-RAG reasoning, citations, and message generation.
 * @module @devlab/logs-ingest/investigations/investigation_service
 */

import type { OllamaEmbedder } from "../embedder/ollama_embedder";
import type { InvestigationStore } from "./investigation_store";
import type {
  HydratedInvestigation,
  InvestigationMessageRecord,
  InvestigationRecord,
  LogCitation,
  UpdateInvestigationInput,
} from "./types";

/**
 * Service managing investigation thread lifecycles and RAG-powered responses.
 */
export class InvestigationService {
  constructor(
    private readonly store: InvestigationStore,
    private readonly embedder: OllamaEmbedder,
  ) {}

  /**
   * Retrieves all conversations for the calling identity.
   */
  async listConversations(userId: string, tenantId?: string): Promise<InvestigationRecord[]> {
    return this.store.listConversations(userId, tenantId);
  }

  /**
   * Hydrates a complete conversation with all message turns.
   */
  async getInvestigation(
    id: string,
    userId: string,
    tenantId?: string,
  ): Promise<HydratedInvestigation | null> {
    const convo = await this.store.getConversation(id, userId, tenantId);
    if (!convo) return null;
    const messages = await this.store.listMessages(id);
    return { ...convo, messages };
  }

  /**
   * Creates a new investigation session and optionally processes the initial question.
   */
  async createInvestigation(
    userId: string,
    tenantId: string | null,
    title: string,
    initialQuery?: string,
  ): Promise<HydratedInvestigation> {
    const convo = await this.store.createConversation(userId, tenantId, title);
    if (initialQuery?.trim()) {
      await this.postUserMessage(convo.id, userId, tenantId, initialQuery.trim());
    }
    const full = await this.getInvestigation(convo.id, userId, tenantId ?? undefined);
    return full!;
  }

  /**
   * Updates conversation title or pin status.
   */
  async updateInvestigation(
    id: string,
    userId: string,
    tenantId: string | undefined,
    updates: UpdateInvestigationInput,
  ): Promise<InvestigationRecord | null> {
    return this.store.updateConversation(id, userId, tenantId, updates);
  }

  /**
   * Deletes a conversation thread and cascaded messages.
   */
  async deleteInvestigation(id: string, userId: string, tenantId?: string): Promise<boolean> {
    return this.store.deleteConversation(id, userId, tenantId);
  }

  /**
   * Posts a user prompt, executes Log-RAG retrieval, and generates an assistant response.
   */
  async postUserMessage(
    conversationId: string,
    _userId: string,
    tenantId: string | null,
    content: string,
  ): Promise<{
    userMessage: InvestigationMessageRecord;
    assistantMessage: InvestigationMessageRecord;
  }> {
    const userMessage = await this.store.addMessage(conversationId, "user", content);

    // Retrieve nearest telemetry episodes via pgvector
    const matches = await this.embedder.searchLogEpisodes(content, 5, tenantId ?? undefined);

    const citations: LogCitation[] = matches.map((m) => ({
      log_id: m.id,
      service: m.service,
      timestamp:
        m.log_timestamp instanceof Date ? m.log_timestamp.toISOString() : String(m.log_timestamp),
      summary: m.summary,
      similarity: m.similarity,
    }));

    const responseContent = this.synthesizeAnalysis(content, citations);
    const assistantMessage = await this.store.addMessage(
      conversationId,
      "assistant",
      responseContent,
      citations,
      { matchesCount: matches.length, model: "devlab-telemetry-rag-v1" },
    );

    return { userMessage, assistantMessage };
  }

  /**
   * Synthesizes forensic root-cause analysis based on retrieved telemetry matches.
   */
  private synthesizeAnalysis(query: string, citations: LogCitation[]): string {
    const topMatch = citations[0];
    if (citations.length === 0 || !topMatch) {
      return (
        `### Investigation Findings\n\n` +
        `No anomalous telemetry episodes or error vectors directly matched **"${query}"** in the current index.\n\n` +
        `**Recommended Next Steps:**\n` +
        `- Try broadening the search query or filtering by specific service names.\n` +
        `- Verify that logs for the target service are active in the live stream.\n` +
        `- Execute an ad-hoc SQL query against partitioned \`system_logs\` for deeper historical inspection.`
      );
    }

    const topPct = (topMatch.similarity * 100).toFixed(1);
    const affectedServices = [...new Set(citations.map((c) => c.service))].join(", ");

    const citationsMarkdown = citations
      .map(
        (c, idx) =>
          `${idx + 1}. **\`${c.service}\`** (${(c.similarity * 100).toFixed(1)}% match)\n` +
          `   > ${c.summary}\n` +
          `   *Observed at: ${new Date(c.timestamp).toISOString()}*`,
      )
      .join("\n\n");

    return (
      `### Incident Forensic Summary\n\n` +
      `Identified **${citations.length} correlated telemetry episodes** related to **"${query}"**.\n\n` +
      `**Impact Analysis:**\n` +
      `- **Primary Suspect Service**: \`${topMatch.service}\` (${topPct}% vector confidence)\n` +
      `- **Involved Services**: \`${affectedServices}\`\n\n` +
      `#### Evidence & Log Episodes\n\n` +
      `${citationsMarkdown}\n\n` +
      `**Recommended Mitigation:**\n` +
      `1. Inspect recent deployment diffs in \`${topMatch.service}\` around \`${new Date(topMatch.timestamp).toLocaleTimeString()}\`.\n` +
      `2. Filter by the affected service in the **Live Explorer** to observe real-time health.\n` +
      `3. Verify database pool limits and downstream RPC timeouts.`
    );
  }
}
