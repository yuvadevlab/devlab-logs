/**
 * @file apps/web/src/features/investigations/components/HistoryThreadItem.tsx
 * @description Single investigation session item in HistoryDrawer with rename and delete actions.
 * @module @devlab/logs-web/features/investigations/components/HistoryThreadItem
 */

"use client";

import React, { useState } from "react";
import { Trash2, Edit2, MessageSquare, Check, X } from "lucide-react";
import { Button, Input, toast } from "@devlab-logs/ui";
import { UI_COPY } from "@/lib/ui-copy";
import type { InvestigationConversation } from "../types";
import { useUpdateInvestigationTitleMutation, useDeleteInvestigationMutation } from "../api";

export interface HistoryThreadItemProps {
  thread: InvestigationConversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onClose: () => void;
  onNewChat: () => void;
}

export function HistoryThreadItem({
  thread,
  isActive,
  onSelect,
  onClose,
  onNewChat,
}: HistoryThreadItemProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);

  const updateTitleMutation = useUpdateInvestigationTitleMutation();
  const deleteMutation = useDeleteInvestigationMutation();

  const handleSaveTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    updateTitleMutation.mutate(
      { id: thread.id, title: editTitle.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success(UI_COPY.INVESTIGATIONS.NOTIFICATIONS.THREAD_RENAMED);
        },
      },
    );
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(thread.id, {
      onSuccess: () => {
        toast.success(UI_COPY.INVESTIGATIONS.NOTIFICATIONS.THREAD_DELETED);
        if (isActive) onNewChat();
      },
    });
  };

  return (
    <div
      onClick={() => {
        onSelect(thread.id);
        onClose();
      }}
      className="group"
      style={{
        display: "flex",
        cursor: "pointer",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "0.5rem",
        padding: "0.5rem 0.625rem",
        backgroundColor: isActive ? "var(--accent)" : "transparent",
        color: isActive
          ? "var(--accentForeground)"
          : "color-mix(in oklab, var(--foreground) 80%, transparent)",
        fontWeight: isActive ? 500 : 400,
        transition: "background-color 150ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          minWidth: 0,
          flex: "1 1 0%",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <MessageSquare className="dl-history-thread__icon" />
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="dl-history-thread__rename-input"
            style={{ height: "1.5rem" }}
            autoFocus
          />
        ) : (
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
            }}
          >
            {thread.title}
          </span>
        )}
      </div>

      <div className="dl-history-thread__actions">
        {isEditing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveTitle}
              className="dl-history-thread__action-btn"
              style={{ color: "var(--primary)" }}
            >
              <Check className="dl-history-thread__action-icon" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              className="dl-history-thread__action-btn"
              style={{ color: "var(--mutedForeground)" }}
            >
              <X className="dl-history-thread__action-icon" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditTitle(thread.title);
              }}
              className="dl-history-thread__action-btn"
              style={{ color: "var(--mutedForeground)" }}
            >
              <Edit2 className="dl-history-thread__action-icon" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="dl-history-thread__action-btn"
              style={{ color: "var(--mutedForeground)" }}
            >
              <Trash2 className="dl-history-thread__action-icon" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
