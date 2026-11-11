/**
 * @file apps/web/src/features/investigations/components/CitationCard.tsx
 * @description Renders a telemetry log citation card with service tags and Explorer links.
 * Employs DevLab Shared Card, Badge, and Button primitives for design-system compliance.
 * @module @devlab/logs-web/features/investigations/components/CitationCard
 */

"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, ExternalLink, Activity } from "lucide-react";
import { Card, CardContent, Badge, Button } from "@devlab-logs/ui";
import type { LogCitation } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

export interface CitationCardProps {
  citation: LogCitation;
}

export function CitationCard({ citation }: CitationCardProps) {
  const matchPct = (citation.similarity * 100).toFixed(1);
  const timeFormatted = new Date(citation.timestamp).toLocaleTimeString();

  return (
    <Card className="dl-citation-card">
      <CardContent
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.75rem" }}
        className="dl-citation-card__trigger"
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Badge
              variant="outline"
              className="dl-citation-card__level-badge"
              style={{
                borderColor: "color-mix(in oklab, var(--primary) 40%, transparent)",
                backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
                color: "var(--primary)",
              }}
            >
              {matchPct}
              {UI_COPY.INVESTIGATIONS.CITATIONS.MATCH}
            </Badge>
            <Badge variant="secondary" className="dl-citation-card__service-badge">
              {citation.service}
            </Badge>
            {citation.trace_id && (
              <Badge
                variant="outline"
                className="dl-citation-card__trace-badge"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  borderColor: "color-mix(in oklab, var(--ai) 40%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--ai) 10%, transparent)",
                  color: "var(--ai)",
                }}
              >
                <GitBranch className="dl-citation-card__trace-icon" />
                {citation.trace_id.slice(0, 10)}
              </Badge>
            )}
          </div>
          <span
            style={{
              color: "var(--mutedForeground)",
              fontSize: "0.625rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timeFormatted}
          </span>
        </div>

        <p
          className="dl-citation-card__message"
          style={{
            color: "color-mix(in oklab, var(--foreground) 90%, transparent)",
            margin: 0,
          }}
        >
          {citation.summary}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.5rem",
            paddingTop: "0.25rem",
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="dl-citation-card__action-btn"
            style={{ height: "1.5rem", padding: "0 0.5rem" }}
          >
            <Link
              href={`/?service=${encodeURIComponent(citation.service)}${citation.trace_id ? `&trace=${encodeURIComponent(citation.trace_id)}` : ""}`}
            >
              <Activity className="dl-citation-card__action-icon dl-citation-card__action-icon--left" />
              {UI_COPY.INVESTIGATIONS.ACTIONS.VIEW_IN_EXPLORER}
              <ExternalLink className="dl-citation-card__action-icon dl-citation-card__action-icon--right" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
