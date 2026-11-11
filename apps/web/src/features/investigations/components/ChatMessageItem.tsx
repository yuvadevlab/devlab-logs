/**
 * @file apps/web/src/features/investigations/components/ChatMessageItem.tsx
 * @description Renders individual conversational turns with markdown parsing and citation cards.
 * @module @devlab/logs-web/features/investigations/components/ChatMessageItem
 */

"use client";

import React from "react";
import { Sparkles, User } from "lucide-react";
import { Badge } from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import type { InvestigationMessage } from "../types";
import { CitationCard } from "./CitationCard";

export interface ChatMessageItemProps {
  message: InvestigationMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("dl-chat-turn", isUser ? "dl-chat-turn--user" : "dl-chat-turn--assistant")}>
      {!isUser && (
        <div className="dl-chat-avatar dl-chat-avatar--assistant">
          <Sparkles className="dl-chat-avatar__icon" />
        </div>
      )}

      <div
        style={{ display: "flex", maxWidth: "85%", flexDirection: "column", gap: "0.5rem" }}
        className={cn(isUser && "dl-chat-turn--align-end")}
      >
        <div
          className={cn(
            "dl-chat-bubble",
            isUser ? "dl-chat-bubble--user" : "dl-chat-bubble--assistant",
          )}
        >
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <MarkdownContent content={message.content} />
            </div>
          )}
        </div>

        {/* Render Telemetry Citations if Assistant */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div
            style={{
              marginTop: "0.25rem",
              display: "flex",
              width: "100%",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Badge
                variant="outline"
                className="dl-chat-message__status-badge"
                style={{
                  borderColor: "color-mix(in oklab, var(--border) 70%, transparent)",
                  color: "var(--mutedForeground)",
                  letterSpacing: "0.05em",
                }}
              >
                Referenced Telemetry Evidence ({message.citations.length})
              </Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
              {message.citations.map((c, idx) => (
                <CitationCard key={c.log_id ?? `${c.service}-${idx}`} citation={c} />
              ))}
            </div>
          </div>
        )}

        <span
          style={{
            color: "var(--mutedForeground)",
            padding: "0 0.25rem",
            fontSize: "0.625rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formattedTime}
        </span>
      </div>

      {isUser && (
        <div className="dl-chat-avatar dl-chat-avatar--user">
          <User className="dl-chat-avatar__icon" />
        </div>
      )}
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      className="font-sans"
    >
      {lines.map((line, idx) => {
        if (line.startsWith("### ")) {
          return (
            <h3
              key={idx}
              style={{
                color: "var(--foreground)",
                paddingTop: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {line.replace("### ", "")}
            </h3>
          );
        }
        if (line.startsWith("#### ")) {
          return (
            <h4
              key={idx}
              style={{
                color: "var(--foreground)",
                paddingTop: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                margin: 0,
              }}
            >
              {line.replace("#### ", "")}
            </h4>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.375rem",
                paddingLeft: "0.5rem",
              }}
            >
              <span
                style={{
                  marginTop: "0.25rem",
                  width: "0.25rem",
                  height: "0.25rem",
                  flexShrink: 0,
                  borderRadius: "9999px",
                  backgroundColor: "var(--primary)",
                }}
              />
              <span>{line.replace("- ", "")}</span>
            </div>
          );
        }
        if (line.trim() === "") {
          return <div key={idx} style={{ height: "0.25rem" }} />;
        }
        return (
          <p key={idx} style={{ margin: 0 }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
