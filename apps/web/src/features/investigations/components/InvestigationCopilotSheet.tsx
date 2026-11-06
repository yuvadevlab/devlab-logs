/**
 * @file apps/web/src/features/investigations/components/InvestigationCopilotSheet.tsx
 * @description Slide-over sheet embedding the persistent AI Investigator inside the Explorer.
 * @module @devlab/logs-web/features/investigations/components/InvestigationCopilotSheet
 */

"use client";

import React from "react";
import { Sheet, SheetContent, SheetTitle } from "@devlab-logs/ui";
import { InvestigationWorkspace } from "./InvestigationWorkspace";
import { UI_COPY } from "@/lib/ui-copy";

export interface InvestigationCopilotSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestigationCopilotSheet({ open, onOpenChange }: InvestigationCopilotSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background flex size-full flex-col border-l p-0 sm:max-w-2xl"
      >
        <SheetTitle className="sr-only">{UI_COPY.INVESTIGATIONS.TITLE}</SheetTitle>
        <InvestigationWorkspace isSheetMode />
      </SheetContent>
    </Sheet>
  );
}
