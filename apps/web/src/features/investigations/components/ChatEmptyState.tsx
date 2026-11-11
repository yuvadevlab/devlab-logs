/**
 * @file apps/web/src/features/investigations/components/ChatEmptyState.tsx
 * @description Welcoming empty state with clickable quick prompt suggestions for incident diagnosis.
 * Employs DevLab Shared EmptyState, Card, and CardContent components.
 * @module @devlab/logs-web/features/investigations/components/ChatEmptyState
 */

"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldAlert, Cpu, Activity, Clock } from "lucide-react";
import { EmptyState, Card, CardContent } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPT_ICONS = [ShieldAlert, Clock, Cpu, Activity];

export function ChatEmptyState({ onSelectPrompt }: ChatEmptyStateProps) {
  const prompts = UI_COPY.INVESTIGATIONS.EMPTY_STATE.PROMPTS;

  return (
    <div
      style={{
        margin: "0 auto",
        display: "flex",
        maxWidth: "42rem",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <EmptyState
        icon={
          <div
            style={{
              display: "grid",
              width: "3rem",
              height: "3rem",
              placeItems: "center",
              borderRadius: "1rem",
              border: "1px solid color-mix(in oklab, var(--primary) 20%, transparent)",
              backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Sparkles className="dl-chat-empty__header-icon" />
          </div>
        }
        title={UI_COPY.INVESTIGATIONS.EMPTY_STATE.HEADING}
        description={UI_COPY.INVESTIGATIONS.EMPTY_STATE.DESCRIPTION}
        className="dl-chat-empty__accordion"
      >
        <div
          style={{
            marginTop: "2rem",
            display: "grid",
            width: "100%",
            gap: "0.625rem",
            textAlign: "left",
          }}
          className="dl-chat-empty__prompts-grid"
        >
          {prompts.map((prompt, idx) => {
            const Icon = PROMPT_ICONS[idx % PROMPT_ICONS.length];
            return (
              <Card key={prompt} onClick={() => onSelectPrompt(prompt)} className="dl-prompt-card">
                <CardContent className="dl-prompt-card__content">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                    <div className="dl-prompt-card__icon">
                      <Icon className="dl-chat-empty__prompt-glyph" />
                    </div>
                    <span
                      style={{
                        color: "color-mix(in oklab, var(--foreground) 90%, transparent)",
                        fontSize: "0.75rem",
                        lineHeight: 1.375,
                        fontWeight: 500,
                      }}
                    >
                      {prompt}
                    </span>
                  </div>
                  <div className="dl-prompt-card__action">
                    <span>Investigate</span>
                    <ArrowRight className="dl-chat-empty__arrow-icon" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </EmptyState>
    </div>
  );
}
