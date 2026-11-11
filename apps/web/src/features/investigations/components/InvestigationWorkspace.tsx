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
    <div className="dl-investigate">
      {/* Workspace Sub-Header / Action Toolbar */}
      <header className="dl-investigate__header">
        <div style={{ display: "flex", minWidth: 0, alignItems: "center", gap: "0.5rem" }}>
          <Sparkles className="dl-investigate__header-icon" style={{ color: "var(--primary)" }} />
          <h1
            style={{
              color: "var(--foreground)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            {activeThread ? activeThread.title : UI_COPY.INVESTIGATIONS.TITLE}
          </h1>
          {activeThread && (
            <Badge
              variant="outline"
              className="dl-investigate__thread-badge"
              style={{ color: "var(--mutedForeground)", fontSize: "0.625rem" }}
            >
              {activeThread.message_count} messages
            </Badge>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHistoryOpen(true)}
            className="dl-investigate__header-action-btn"
          >
            <History className="dl-investigate__header-btn-icon dl-investigate__header-btn-icon--left" />
            {UI_COPY.INVESTIGATIONS.ACTIONS.HISTORY}
          </Button>
          <Button size="sm" onClick={startNewChat} className="dl-investigate__header-action-btn">
            <Plus className="dl-investigate__header-btn-icon dl-investigate__header-btn-icon--right" />
            {UI_COPY.INVESTIGATIONS.ACTIONS.NEW_CHAT}
          </Button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} onScroll={handleScroll} className="dl-investigate__scroll">
        <div className="dl-investigate__container">
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={(p) => handleSendMessage(p)} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
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
          className="dl-investigate__jump-btn"
        >
          <ArrowDown
            className={`size-3.5 ${isSubmitting ? "animate-bounce" : ""}`}
            style={isSubmitting ? { color: "var(--primary)" } : undefined}
          />
          <span>{UI_COPY.INVESTIGATIONS.ACTIONS.JUMP_TO_LATEST}</span>
        </Button>
      )}

      {/* Bottom Input Composer */}
      <footer className="dl-investigate__footer">
        <div className="dl-investigate__container">
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
