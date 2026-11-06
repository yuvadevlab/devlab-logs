/**
 * @file apps/ingest/src/investigations/investigation_routes.ts
 * @description Express routing layer for AI Incident Investigation sessions and messages.
 * Authenticated via `requireLogReadAccess` with tenant and user isolation.
 * @module @devlab/logs-ingest/investigations/investigation_routes
 */

import { Router } from "express";
import { getLogsPrincipal } from "../auth";
import type { InvestigationService } from "./investigation_service";
import { CreateInvestigationSchema, UpdateInvestigationSchema, CreateMessageSchema } from "./types";

/**
 * Creates and configures the Express router for AI Investigation sessions.
 */
export function createInvestigationRouter(service: InvestigationService): Router {
  const router = Router();

  // List all conversations for the authenticated user/tenant
  router.get("/", async (_req, res) => {
    try {
      const principal = getLogsPrincipal(res.locals.logsPrincipal);
      const tenantId = principal.kind === "user" ? principal.tenantId : undefined;
      const conversations = await service.listConversations(principal.userId, tenantId);
      res.status(200).json({ conversations });
    } catch {
      res.status(500).json({ error: "Failed to list investigation conversations." });
    }
  });

  // Create a new investigation conversation
  router.post("/", async (req, res) => {
    try {
      const principal = getLogsPrincipal(res.locals.logsPrincipal);
      const tenantId = principal.kind === "user" ? principal.tenantId : null;
      const parsed = CreateInvestigationSchema.safeParse(req.body);

      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid investigation payload.", details: parsed.error.issues });
        return;
      }

      const conversation = await service.createInvestigation(
        principal.userId,
        tenantId,
        parsed.data.title,
        parsed.data.initialQuery,
      );
      res.status(201).json({ conversation });
    } catch {
      res.status(500).json({ error: "Failed to create investigation conversation." });
    }
  });

  // Retrieve an individual hydrated investigation thread
  router.get("/:id", async (req, res) => {
    try {
      const principal = getLogsPrincipal(res.locals.logsPrincipal);
      const tenantId = principal.kind === "user" ? principal.tenantId : undefined;
      const conversation = await service.getInvestigation(
        req.params.id,
        principal.userId,
        tenantId,
      );

      if (!conversation) {
        res.status(404).json({ error: "Investigation conversation not found." });
        return;
      }

      res.status(200).json({ conversation });
    } catch {
      res.status(500).json({ error: "Failed to fetch investigation conversation." });
    }
  });

  // Update conversation title or pinned status
  router.patch("/:id", async (req, res) => {
    try {
      const principal = getLogsPrincipal(res.locals.logsPrincipal);
      const tenantId = principal.kind === "user" ? principal.tenantId : undefined;
      const parsed = UpdateInvestigationSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ error: "Invalid update payload.", details: parsed.error.issues });
        return;
      }

      const updated = await service.updateInvestigation(
        req.params.id,
        principal.userId,
        tenantId,
        parsed.data,
      );

      if (!updated) {
        res.status(404).json({ error: "Investigation conversation not found." });
        return;
      }

      res.status(200).json({ conversation: updated });
    } catch {
      res.status(500).json({ error: "Failed to update investigation conversation." });
    }
  });

  // Delete an investigation conversation and its cascaded messages
  router.delete("/:id", async (req, res) => {
    try {
      const principal = getLogsPrincipal(res.locals.logsPrincipal);
      const tenantId = principal.kind === "user" ? principal.tenantId : undefined;
      const deleted = await service.deleteInvestigation(req.params.id, principal.userId, tenantId);

      if (!deleted) {
        res.status(404).json({ error: "Investigation conversation not found." });
        return;
      }

      res.status(200).json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete investigation conversation." });
    }
  });

  // Post a user message and trigger Log-RAG incident investigation response
  router.post("/:id/messages", async (req, res) => {
    try {
      const principal = getLogsPrincipal(res.locals.logsPrincipal);
      const tenantId = principal.kind === "user" ? principal.tenantId : null;
      const parsed = CreateMessageSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({ error: "Invalid message payload.", details: parsed.error.issues });
        return;
      }

      const turns = await service.postUserMessage(
        req.params.id,
        principal.userId,
        tenantId,
        parsed.data.content,
      );

      res.status(201).json(turns);
    } catch {
      res.status(500).json({ error: "Failed to process investigation message." });
    }
  });

  return router;
}
