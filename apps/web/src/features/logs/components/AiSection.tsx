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
    <div className="panel p-3">
      <div className="text-ai mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
        <Icon className="size-3.5" />
        {title}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
