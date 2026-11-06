/**
 * @file apps/web/src/app/(dashboard)/investigate/[[...id]]/page.tsx
 * @description Dedicated pure SSR server route for persistent AI Incident Investigations.
 * Resolves both root `/investigate` (new thread) and deep-linked `/investigate/[id]`.
 * @module @devlab/logs-web/app/(dashboard)/investigate
 */

import React from "react";
import type { Metadata } from "next";
import { InvestigationWorkspace } from "@/features/investigations";

export const metadata: Metadata = {
  title: "AI Incident Investigator — DevLab Logs",
  description:
    "Autonomous Log-RAG incident investigation, semantic vector search, and root-cause synthesis.",
};

export interface InvestigatePageProps {
  /** Dynamic route parameters resolved asynchronously in Next.js 15 */
  readonly params: Promise<{ id?: string[] }>;
}

/**
 * Pure SSR Server Component route resolving incident conversation identifier.
 *
 * @param props - Async route properties containing optional dynamic segment id
 * @returns React JSX element rendering InvestigationWorkspace
 */
export default async function InvestigatePage({
  params,
}: InvestigatePageProps): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id;
  const conversationId = Array.isArray(rawId) ? rawId[0] : rawId;

  return <InvestigationWorkspace initialConversationId={conversationId} />;
}
