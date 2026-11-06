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
    <div className={cn("flex w-full gap-3 py-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="bg-primary/10 text-primary border-primary/20 flex size-8 shrink-0 items-center justify-center rounded-lg border">
          <Sparkles className="size-4" />
        </div>
      )}

      <div className={cn("flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-xs leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-xs font-medium"
              : "bg-card border-border/70 text-foreground rounded-tl-xs border shadow-xs",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="space-y-2">
              <MarkdownContent content={message.content} />
            </div>
          )}
        </div>

        {/* Render Telemetry Citations if Assistant */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-1 flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-border/70 text-muted-foreground font-mono text-[9px] tracking-wider uppercase"
              >
                Referenced Telemetry Evidence ({message.citations.length})
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {message.citations.map((c, idx) => (
                <CitationCard key={c.log_id ?? `${c.service}-${idx}`} citation={c} />
              ))}
            </div>
          </div>
        )}

        <span className="text-muted-foreground px-1 text-[10px] tabular-nums">{formattedTime}</span>
      </div>

      {isUser && (
        <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg border">
          <User className="size-4" />
        </div>
      )}
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  // Clean markdown line-by-line renderer
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 font-sans">
      {lines.map((line, idx) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-foreground pt-1 text-sm font-semibold">
              {line.replace("### ", "")}
            </h3>
          );
        }
        if (line.startsWith("#### ")) {
          return (
            <h4 key={idx} className="text-foreground pt-1 text-xs font-medium">
              {line.replace("#### ", "")}
            </h4>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-2">
              <span className="text-primary mt-1 size-1 shrink-0 rounded-full bg-current" />
              <span>{line.replace("- ", "")}</span>
            </div>
          );
        }
        if (line.trim() === "") {
          return <div key={idx} className="h-1" />;
        }
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}
