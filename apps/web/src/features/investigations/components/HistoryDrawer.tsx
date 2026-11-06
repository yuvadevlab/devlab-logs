/**
 * @file apps/web/src/features/investigations/components/HistoryDrawer.tsx
 * @description Slide-over drawer listing past incident investigation sessions grouped by time.
 * Employs DevLab Shared Sheet, ScrollArea, Input, and Button components.
 * @module @devlab/logs-web/features/investigations/components/HistoryDrawer
 */

"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit2, MessageSquare, Check, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Input,
  ScrollArea,
  toast,
} from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { InvestigationConversation, GroupedInvestigations } from "../types";
import { useUpdateInvestigationTitleMutation, useDeleteInvestigationMutation } from "../api";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [now] = useState(() => Date.now());

  const updateTitleMutation = useUpdateInvestigationTitleMutation();
  const deleteMutation = useDeleteInvestigationMutation();

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

  const handleSaveTitle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    updateTitleMutation.mutate(
      { id, title: editTitle.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success(UI_COPY.INVESTIGATIONS.NOTIFICATIONS.THREAD_RENAMED);
        },
      },
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(UI_COPY.INVESTIGATIONS.NOTIFICATIONS.THREAD_DELETED);
        if (activeId === id) onNewChat();
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-popover flex w-full max-w-sm flex-col border-r p-4">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle className="text-base font-semibold">
            {UI_COPY.INVESTIGATIONS.TITLE}
          </SheetTitle>
          <SheetDescription className="text-xs">{UI_COPY.INVESTIGATIONS.SUBTITLE}</SheetDescription>
        </SheetHeader>

        <Button
          size="sm"
          onClick={() => {
            onNewChat();
            onOpenChange(false);
          }}
          className="mt-4 w-full"
        >
          <Plus className="mr-1.5 size-4" />
          {UI_COPY.INVESTIGATIONS.NEW_INVESTIGATION}
        </Button>

        <div className="mt-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={UI_COPY.INVESTIGATIONS.SEARCH_THREADS}
            startIcon={<Search className="text-muted-foreground size-3.5" />}
            className="h-8 font-sans text-xs"
          />
        </div>

        <ScrollArea className="mt-4 flex-1 pr-1 text-xs">
          <div className="space-y-4 pr-2">
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
                <div key={groupKey} className="space-y-1">
                  <div className="text-muted-foreground px-2 text-[10px] font-semibold tracking-wider uppercase">
                    {groupTitle}
                  </div>
                  {items.map((thread) => {
                    const isActive = thread.id === activeId;
                    const isEditing = thread.id === editingId;

                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          onSelect(thread.id);
                          onOpenChange(false);
                        }}
                        className={`group hover:bg-accent/60 flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 transition ${isActive ? "bg-accent text-accent-foreground font-medium" : "text-foreground/80"}`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <MessageSquare className="text-primary size-3.5 shrink-0" />
                          {isEditing ? (
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 font-sans text-xs"
                              autoFocus
                            />
                          ) : (
                            <span className="truncate text-xs">{thread.title}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleSaveTitle(thread.id, e)}
                                className="text-primary hover:bg-primary/10 size-6 p-0"
                              >
                                <Check className="size-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(null);
                                }}
                                className="text-muted-foreground hover:bg-accent size-6 p-0"
                              >
                                <X className="size-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(thread.id);
                                  setEditTitle(thread.title);
                                }}
                                className="text-muted-foreground hover:text-foreground size-6 p-0"
                              >
                                <Edit2 className="size-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleDelete(thread.id, e)}
                                className="text-muted-foreground hover:text-destructive size-6 p-0"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
