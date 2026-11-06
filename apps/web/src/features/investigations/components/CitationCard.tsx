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
    <Card className="bg-card/70 border-border/60 hover:border-primary/50 transition">
      <CardContent className="flex flex-col gap-2 p-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary font-mono text-[10px] font-semibold"
            >
              {matchPct}
              {UI_COPY.INVESTIGATIONS.CITATIONS.MATCH}
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] font-semibold">
              {citation.service}
            </Badge>
            {citation.trace_id && (
              <Badge
                variant="outline"
                className="border-ai/40 bg-ai/10 text-ai flex items-center gap-1 font-mono text-[10px]"
              >
                <GitBranch className="size-3" />
                {citation.trace_id.slice(0, 10)}
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground text-[10px] tabular-nums">{timeFormatted}</span>
        </div>

        <p className="text-foreground/90 font-sans text-xs leading-relaxed">{citation.summary}</p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button size="sm" variant="ghost" asChild className="h-6 px-2 font-sans text-[11px]">
            <Link
              href={`/?service=${encodeURIComponent(citation.service)}${citation.trace_id ? `&trace=${encodeURIComponent(citation.trace_id)}` : ""}`}
            >
              <Activity className="mr-1 size-3" />
              {UI_COPY.INVESTIGATIONS.ACTIONS.VIEW_IN_EXPLORER}
              <ExternalLink className="ml-1 size-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
