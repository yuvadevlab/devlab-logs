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
    <div className="bg-card/90 border-border/80 relative rounded-2xl border p-2 shadow-sm backdrop-blur-md">
      <div className="flex items-end gap-2">
        <div className="text-primary mt-2 ml-2 hidden sm:block">
          <Sparkles className="size-4" />
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={UI_COPY.INVESTIGATIONS.COMPOSER.PLACEHOLDER}
          disabled={disabled || isLoading}
          rows={1}
          className="placeholder:text-muted-foreground text-foreground max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-xs focus:outline-hidden"
        />
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={disabled || isLoading || !input.trim()}
          className="size-8 shrink-0 rounded-xl p-0"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </Button>
      </div>

      <div className="text-muted-foreground flex items-center justify-between px-3 pt-1 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="border-border/80 bg-muted text-muted-foreground rounded border px-1 py-0.5 font-mono text-[9px]">
            Enter ↵
          </kbd>
          <span>to send,</span>
          <kbd className="border-border/80 bg-muted text-muted-foreground rounded border px-1 py-0.5 font-mono text-[9px]">
            Shift + Enter
          </kbd>
          <span>for new line</span>
        </div>
        <span className="font-mono">{input.length} / 4000</span>
      </div>
    </div>
  );
}
