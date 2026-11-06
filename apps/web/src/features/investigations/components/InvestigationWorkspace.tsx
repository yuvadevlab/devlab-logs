/**
 * @file apps/web/src/features/investigations/components/InvestigationWorkspace.tsx
 * @description Master conversational workspace for AI Incident Investigations.
 * Integrates thread history, zero-latency caching, and citation-backed messaging.
 * @module @devlab/logs-web/features/investigations/components/InvestigationWorkspace
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { History, Plus, Sparkles, ArrowDown } from "lucide-react";
import { Button, Badge } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { useInvestigationSession } from "../hooks/useInvestigationSession";
import { HistoryDrawer } from "./HistoryDrawer";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatComposer } from "./ChatComposer";

export interface InvestigationWorkspaceProps {
  initialConversationId?: string;
}

export function InvestigationWorkspace({ initialConversationId }: InvestigationWorkspaceProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    activeId,
    conversations,
    messages,
    input,
    setInput,
    isSubmitting,
    selectConversation,
    startNewChat,
    handleSendMessage,
  } = useInvestigationSession(initialConversationId);

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isAtBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    setIsAtBottom(atBottom);
  };

  const activeThread = conversations.find((c) => c.id === activeId);

  return (
    <div className="bg-background relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Workspace Sub-Header / Action Toolbar */}
      <header className="border-border/60 bg-card/40 flex h-11 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="text-primary size-3.5 shrink-0" />
          <h1 className="text-foreground truncate text-xs font-semibold tracking-tight">
            {activeThread ? activeThread.title : UI_COPY.INVESTIGATIONS.TITLE}
          </h1>
          {activeThread && (
            <Badge
              variant="outline"
              className="text-muted-foreground hidden text-[10px] sm:inline-flex"
            >
              {activeThread.message_count} messages
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHistoryOpen(true)}
            className="h-7 font-sans text-xs"
          >
            <History className="mr-1.5 size-3.5" />
            {UI_COPY.INVESTIGATIONS.ACTIONS.HISTORY}
          </Button>
          <Button size="sm" onClick={startNewChat} className="h-7 font-sans text-xs">
            <Plus className="mr-1 size-3.5" />
            {UI_COPY.INVESTIGATIONS.ACTIONS.NEW_CHAT}
          </Button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-4 sm:px-6"
      >
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={(p) => handleSendMessage(p)} />
          ) : (
            <div className="space-y-1">
              {messages.map((m) => (
                <ChatMessageItem key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jump to latest floating pill */}
      {!isAtBottom && messages.length > 0 && (
        <Button
          size="sm"
          variant="secondary"
          onClick={scrollToBottom}
          className="border-border/80 absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-3 py-1 text-xs shadow-md backdrop-blur-md"
        >
          <ArrowDown className={`size-3.5 ${isSubmitting ? "text-primary animate-bounce" : ""}`} />
          <span>{UI_COPY.INVESTIGATIONS.ACTIONS.JUMP_TO_LATEST}</span>
        </Button>
      )}

      {/* Bottom Input Composer */}
      <footer className="border-border/60 bg-background/80 p-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatComposer
            input={input}
            setInput={setInput}
            onSubmit={() => handleSendMessage()}
            isLoading={isSubmitting}
          />
        </div>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNewChat={startNewChat}
      />
    </div>
  );
}
