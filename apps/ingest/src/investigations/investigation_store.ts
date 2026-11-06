/**
 * @file apps/ingest/src/investigations/investigation_store.ts
 * @description PostgreSQL persistence layer for AI Incident Investigation threads and messages.
 * Uses strict snake_case column names and isolated user/tenant scoping.
 * @module @devlab/logs-ingest/investigations/investigation_store
 */

import { Pool } from "pg";
import type {
  InvestigationRecord,
  InvestigationMessageRecord,
  LogCitation,
  UpdateInvestigationInput,
} from "./types";

/**
 * Data access store handling conversations and messages persistence.
 */
export class InvestigationStore {
  constructor(private readonly pool: Pool) {}

  /**
   * Lists all conversations for a user/tenant, ordered by most recently updated.
   */
  async listConversations(userId: string, tenantId?: string): Promise<InvestigationRecord[]> {
    const query = `
      SELECT 
        c.id, c.tenant_id, c.user_id, c.title, c.summary, c.pinned,
        c.created_at, c.updated_at,
        COUNT(m.id)::int AS message_count
      FROM investigation_conversations c
      LEFT JOIN investigation_messages m ON m.conversation_id = c.id
      WHERE (c.user_id = $1 OR ($2::text IS NOT NULL AND c.tenant_id = $2))
      GROUP BY c.id
      ORDER BY c.pinned DESC, c.updated_at DESC
      LIMIT 100;
    `;
    const res = await this.pool.query<InvestigationRecord>(query, [userId, tenantId ?? null]);
    return res.rows;
  }

  /**
   * Retrieves a single conversation by ID with multi-tenant protection.
   */
  async getConversation(
    id: string,
    userId: string,
    tenantId?: string,
  ): Promise<InvestigationRecord | null> {
    const query = `
      SELECT id, tenant_id, user_id, title, summary, pinned, created_at, updated_at
      FROM investigation_conversations
      WHERE id = $1 AND (user_id = $2 OR ($3::text IS NOT NULL AND tenant_id = $3));
    `;
    const res = await this.pool.query<InvestigationRecord>(query, [id, userId, tenantId ?? null]);
    return res.rows[0] ?? null;
  }

  /**
   * Inserts a new conversation record.
   */
  async createConversation(
    userId: string,
    tenantId: string | null,
    title: string,
    summary?: string,
  ): Promise<InvestigationRecord> {
    const query = `
      INSERT INTO investigation_conversations (user_id, tenant_id, title, summary)
      VALUES ($1, $2, $3, $4)
      RETURNING id, tenant_id, user_id, title, summary, pinned, created_at, updated_at;
    `;
    const res = await this.pool.query<InvestigationRecord>(query, [
      userId,
      tenantId,
      title,
      summary ?? null,
    ]);
    const record = res.rows[0];
    if (!record) {
      throw new Error("Failed to persist investigation conversation.");
    }
    return record;
  }

  /**
   * Updates an existing conversation's title or pin state.
   */
  async updateConversation(
    id: string,
    userId: string,
    tenantId: string | undefined,
    updates: UpdateInvestigationInput,
  ): Promise<InvestigationRecord | null> {
    const sets: string[] = ["updated_at = NOW()"];
    const values: unknown[] = [id, userId, tenantId ?? null];
    let idx = 4;

    if (updates.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.pinned !== undefined) {
      sets.push(`pinned = $${idx}`);
      values.push(updates.pinned);
    }

    const query = `
      UPDATE investigation_conversations
      SET ${sets.join(", ")}
      WHERE id = $1 AND (user_id = $2 OR ($3::text IS NOT NULL AND tenant_id = $3))
      RETURNING id, tenant_id, user_id, title, summary, pinned, created_at, updated_at;
    `;
    const res = await this.pool.query<InvestigationRecord>(query, values);
    return res.rows[0] ?? null;
  }

  /**
   * Deletes a conversation and its messages via CASCADE.
   */
  async deleteConversation(id: string, userId: string, tenantId?: string): Promise<boolean> {
    const query = `
      DELETE FROM investigation_conversations
      WHERE id = $1 AND (user_id = $2 OR ($3::text IS NOT NULL AND tenant_id = $3));
    `;
    const res = await this.pool.query(query, [id, userId, tenantId ?? null]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Retrieves all messages for a given conversation ordered chronologically.
   */
  async listMessages(conversationId: string): Promise<InvestigationMessageRecord[]> {
    const query = `
      SELECT id, conversation_id, role, content, citations, metadata, created_at
      FROM investigation_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC;
    `;
    const res = await this.pool.query<InvestigationMessageRecord>(query, [conversationId]);
    return res.rows;
  }

  /**
   * Adds an individual message turn to a conversation thread.
   */
  async addMessage(
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string,
    citations: LogCitation[] = [],
    metadata: Record<string, unknown> = {},
  ): Promise<InvestigationMessageRecord> {
    const query = `
      INSERT INTO investigation_messages (conversation_id, role, content, citations, metadata)
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
      RETURNING id, conversation_id, role, content, citations, metadata, created_at;
    `;
    const res = await this.pool.query<InvestigationMessageRecord>(query, [
      conversationId,
      role,
      content,
      JSON.stringify(citations),
      JSON.stringify(metadata),
    ]);

    // Touch conversation updated_at
    await this.pool.query(
      "UPDATE investigation_conversations SET updated_at = NOW() WHERE id = $1",
      [conversationId],
    );

    const record = res.rows[0];
    if (!record) {
      throw new Error("Failed to persist investigation conversation.");
    }
    return record;
  }
}
