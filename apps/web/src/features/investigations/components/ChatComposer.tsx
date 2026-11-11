/**
 * @file apps/web/src/features/investigations/components/ChatComposer.tsx
 * @description Interactive input composer for submitting natural language incident queries.
 * @module @devlab/logs-web/features/investigations/components/ChatComposer
 */

"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { Button } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";

export interface ChatComposerProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatComposer({
  input,
  setInput,
  onSubmit,
  disabled = false,
  isLoading = false,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isLoading && input.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="dl-chat-composer">
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
        <div className="dl-chat-composer__sparkle-wrapper">
          <Sparkles className="dl-chat-composer__sparkle-icon" />
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={UI_COPY.INVESTIGATIONS.COMPOSER.PLACEHOLDER}
          disabled={disabled || isLoading}
          rows={1}
          className="dl-chat-composer__textarea"
        />
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={disabled || isLoading || !input.trim()}
          className="dl-chat-composer__action-btn"
        >
          {isLoading ? (
            <Loader2 className="dl-chat-composer__submit-icon dl-spinner" />
          ) : (
            <ArrowUp className="dl-chat-composer__submit-icon" />
          )}
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.25rem 0.75rem 0",
          fontSize: "0.625rem",
          color: "var(--mutedForeground)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span>Press</span>
          <kbd
            style={{
              borderRadius: "0.25rem",
              border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
              backgroundColor: "var(--muted)",
              padding: "0.125rem 0.25rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.5625rem",
            }}
          >
            Enter ↵
          </kbd>
          <span>to send,</span>
          <kbd
            style={{
              borderRadius: "0.25rem",
              border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
              backgroundColor: "var(--muted)",
              padding: "0.125rem 0.25rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.5625rem",
            }}
          >
            Shift + Enter
          </kbd>
          <span>for new line</span>
        </div>
        <span className="dl-chat-composer__char-counter">{input.length} / 4000</span>
      </div>
    </div>
  );
}
