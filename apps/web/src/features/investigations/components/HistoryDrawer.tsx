/**
 * @file apps/web/src/features/investigations/components/HistoryDrawer.tsx
 * @description Slide-over drawer listing past incident investigation sessions grouped by time.
 * Employs DevLab Shared Sheet, ScrollArea, Input, and Button components.
 * @module @devlab/logs-web/features/investigations/components/HistoryDrawer
 */

"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Input,
  ScrollArea,
} from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { InvestigationConversation, GroupedInvestigations } from "../types";
import { HistoryThreadItem } from "./HistoryThreadItem";

export interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: InvestigationConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export function HistoryDrawer({
  open,
  onOpenChange,
  conversations,
  activeId,
  onSelect,
  onNewChat,
}: HistoryDrawerProps) {
  const [search, setSearch] = useState("");
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, search]);

  const groups = useMemo<GroupedInvestigations>(() => {
    const oneDay = 24 * 60 * 60 * 1000;
    const res: GroupedInvestigations = { today: [], yesterday: [], previous7Days: [], older: [] };
    filtered.forEach((c) => {
      const diff = now - new Date(c.updated_at).getTime();
      if (diff < oneDay) res.today.push(c);
      else if (diff < 2 * oneDay) res.yesterday.push(c);
      else if (diff < 7 * oneDay) res.previous7Days.push(c);
      else res.older.push(c);
    });
    return res;
  }, [filtered, now]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="dl-history-drawer"
        style={{ display: "flex", width: "100%", maxWidth: "24rem", flexDirection: "column" }}
      >
        <SheetHeader
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left" }}
        >
          <SheetTitle style={{ fontSize: "1rem", fontWeight: 600 }}>
            {UI_COPY.INVESTIGATIONS.TITLE}
          </SheetTitle>
          <SheetDescription style={{ fontSize: "0.75rem" }}>
            {UI_COPY.INVESTIGATIONS.SUBTITLE}
          </SheetDescription>
        </SheetHeader>

        <Button
          size="sm"
          onClick={() => {
            onNewChat();
            onOpenChange(false);
          }}
          style={{ marginTop: "1rem", width: "100%" }}
        >
          <Plus className="dl-history-drawer__new-icon" />
          {UI_COPY.INVESTIGATIONS.NEW_INVESTIGATION}
        </Button>

        <div style={{ marginTop: "0.75rem" }}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={UI_COPY.INVESTIGATIONS.SEARCH_THREADS}
            startIcon={<Search className="dl-history-drawer__search-icon" />}
            className="dl-history-drawer__search-input"
            style={{ height: "2rem" }}
          />
        </div>

        <ScrollArea className="dl-history-drawer__scroll">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              paddingRight: "0.5rem",
            }}
          >
            {(Object.keys(groups) as (keyof GroupedInvestigations)[]).map((groupKey) => {
              const items = groups[groupKey];
              if (items.length === 0) return null;
              const groupTitle =
                groupKey === "today"
                  ? UI_COPY.INVESTIGATIONS.GROUPS.TODAY
                  : groupKey === "yesterday"
                    ? UI_COPY.INVESTIGATIONS.GROUPS.YESTERDAY
                    : groupKey === "previous7Days"
                      ? UI_COPY.INVESTIGATIONS.GROUPS.PREVIOUS_7_DAYS
                      : UI_COPY.INVESTIGATIONS.GROUPS.OLDER;

              return (
                <div
                  key={groupKey}
                  style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
                >
                  <div
                    style={{
                      color: "var(--mutedForeground)",
                      padding: "0 0.5rem",
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {groupTitle}
                  </div>
                  {items.map((thread) => (
                    <HistoryThreadItem
                      key={thread.id}
                      thread={thread}
                      isActive={thread.id === activeId}
                      onSelect={onSelect}
                      onClose={() => onOpenChange(false)}
                      onNewChat={onNewChat}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
