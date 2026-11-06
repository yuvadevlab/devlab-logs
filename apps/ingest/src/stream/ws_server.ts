/**
 * @file apps/ingest/src/stream/ws_server.ts
 * @description WebSocket live telemetry broadcast server and ticket management.
 * @module @devlab/logs-ingest/stream/ws_server
 */

import { randomBytes } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket } from "ws";
import type { LogsPrincipal } from "../auth";

export class TelemetryWsServer {
  private readonly wss = new WebSocketServer({ noServer: true });
  private readonly tickets = new Map<string, { principal: LogsPrincipal; expiresAt: number }>();
  private readonly clients = new Map<WebSocket, LogsPrincipal>();

  constructor(private readonly allowedOrigins: Set<string>) {
    setInterval(() => {
      const now = Date.now();
      for (const [ticket, data] of this.tickets) {
        if (data.expiresAt <= now) this.tickets.delete(ticket);
      }
    }, 30_000).unref();
  }

  /**
   * Generates a 30-second single-use ticket for WebSocket authentication.
   */
  createTicket(principal: LogsPrincipal): string {
    const ticket = randomBytes(32).toString("base64url");
    this.tickets.set(ticket, { principal, expiresAt: Date.now() + 30_000 });
    return ticket;
  }

  get ticketCount(): number {
    return this.tickets.size;
  }

  /**
   * Handles HTTP upgrade requests for live log streaming.
   */
  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const origin = request.headers.origin;
    if (url.pathname !== "/stream" || !origin || !this.allowedOrigins.has(origin)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    const ticket = url.searchParams.get("ticket");
    const ticketData = ticket ? this.tickets.get(ticket) : undefined;
    if (!ticket || !ticketData || ticketData.expiresAt <= Date.now()) {
      if (ticket) this.tickets.delete(ticket);
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    this.tickets.delete(ticket);
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.clients.set(ws, ticketData.principal);
      ws.on("close", () => this.clients.delete(ws));
      ws.on("error", () => this.clients.delete(ws));
    });
  }

  /**
   * Broadcasts a telemetry event to all authorized WebSocket clients.
   */
  broadcast(log: unknown): void {
    if (
      !log ||
      typeof log !== "object" ||
      !("tenant_id" in log) ||
      (log.tenant_id !== null && typeof log.tenant_id !== "string")
    ) {
      return;
    }
    const payload = JSON.stringify(log);
    for (const [client, principal] of this.clients) {
      const canRead =
        principal.kind === "service" ||
        principal.isSuperAdmin ||
        (!!principal.tenantId && log.tenant_id === principal.tenantId);
      if (client.readyState === WebSocket.OPEN && canRead) {
        client.send(payload);
      }
    }
  }

  close(): void {
    this.wss.close();
  }
}
