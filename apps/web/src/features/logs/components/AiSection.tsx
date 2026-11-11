"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

export interface AiSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

/**
 * Reusable card section for Log-RAG incident investigation views.
 */
export function AiSection({ icon: Icon, title, children }: AiSectionProps) {
  return (
    <div className="panel" style={{ padding: "0.75rem" }}>
      <div
        style={{
          color: "var(--ai)",
          marginBottom: "0.375rem",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <Icon className="dl-ai-modal__section-icon" />
        {title}
      </div>
      <div style={{ fontSize: "0.875rem", lineHeight: 1.625 }}>{children}</div>
    </div>
  );
}
