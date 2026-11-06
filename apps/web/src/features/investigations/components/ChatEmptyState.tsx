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
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-8">
      <EmptyState
        icon={
          <div className="bg-primary/10 text-primary border-primary/20 grid size-12 place-items-center rounded-2xl border">
            <Sparkles className="size-6" />
          </div>
        }
        title={UI_COPY.INVESTIGATIONS.EMPTY_STATE.HEADING}
        description={UI_COPY.INVESTIGATIONS.EMPTY_STATE.DESCRIPTION}
        className="w-full border-none bg-transparent p-0"
      >
        <div className="mt-8 grid w-full grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
          {prompts.map((prompt, idx) => {
            const Icon = PROMPT_ICONS[idx % PROMPT_ICONS.length];
            return (
              <Card
                key={prompt}
                onClick={() => onSelectPrompt(prompt)}
                className="bg-card/60 hover:bg-accent/40 border-border/60 hover:border-primary/50 group cursor-pointer shadow-none transition"
              >
                <CardContent className="flex h-full flex-col justify-between gap-3 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-muted text-muted-foreground group-hover:text-primary mt-0.5 rounded-md p-1.5 transition">
                      <Icon className="size-3.5" />
                    </div>
                    <span className="text-foreground/90 text-xs leading-snug font-medium">
                      {prompt}
                    </span>
                  </div>
                  <div className="text-primary flex items-center gap-1 text-[11px] font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                    <span>Investigate</span>
                    <ArrowRight className="size-3" />
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
