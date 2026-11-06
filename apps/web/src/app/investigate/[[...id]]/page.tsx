/**
 * @file apps/web/src/app/investigate/[[...id]]/page.tsx
 * @description Dedicated route for persistent AI Incident Investigations.
 * Resolves both root `/investigate` (new thread) and deep-linked `/investigate/[id]`.
 * @module @devlab/logs-web/app/investigate
 */

"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { InvestigationWorkspace } from "@/features/investigations";

export default function InvestigatePageRoute() {
  const params = useParams();
  const rawId = params?.id;
  const conversationId = Array.isArray(rawId) ? rawId[0] : rawId;

  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden select-none">
      <AppNavbar />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <InvestigationWorkspace initialConversationId={conversationId} />
      </main>
    </div>
  );
}
