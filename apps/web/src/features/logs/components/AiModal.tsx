"use client";

import React, { useMemo, useState } from "react";
import { Bot, Sparkles, Wrench, Target, FileSearch, Database, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@devlab-logs/ui";
import { cn } from "@/lib/utils";
import { LogLevel, AiAnalysisPhase, type LogEvent, type LogEpisodeMatch } from "../types";
import { useRagSearchMutation } from "../api/rag-search";
import { AiSection } from "./AiSection";
import { UI_COPY } from "@/lib/ui-copy";

export interface AiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: LogEvent[];
}

/**
 * Natural language Log-RAG incident investigation modal.
 * Connects directly to DevLab Ingestion Gateway's vector similarity search.
 */
export function AiModal({ open, onOpenChange, logs }: AiModalProps) {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState(0);

  const ragMutation = useRagSearchMutation();
  const investigationSteps = UI_COPY.LOGS.AI.INVESTIGATION_STEPS;

  const phase: AiAnalysisPhase = ragMutation.isPending
    ? AiAnalysisPhase.THINKING
    : ragMutation.isError
      ? AiAnalysisPhase.ERROR
      : ragMutation.data
        ? AiAnalysisPhase.DONE
        : AiAnalysisPhase.IDLE;

  const bufferAnalysis = useMemo(() => {
    const errs = logs.filter((l) => l.level === LogLevel.ERROR || l.level === LogLevel.FATAL);
    const bySvc: Record<string, number> = {};
    errs.forEach((l) => {
      bySvc[l.service] = (bySvc[l.service] ?? 0) + 1;
    });
    const top = Object.entries(bySvc).sort((a, b) => b[1] - a[1]);
    return { errorCount: errs.length, topServices: top };
  }, [logs]);

  const handleInvestigate = () => {
    if (!prompt.trim() || ragMutation.isPending) return;

    setStep(0);
    investigationSteps.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), 300 * (i + 1));
    });

    ragMutation.mutate({ query: prompt.trim(), limit: 5 });
  };

  const matches: LogEpisodeMatch[] = ragMutation.data?.matches ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-ai size-4" />
            Log-RAG Incident Investigation
          </DialogTitle>
          <DialogDescription>{UI_COPY.LOGS.AI.ASK_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvestigate()}
            placeholder={UI_COPY.LOGS.AI.PROMPT_PLACEHOLDER}
            className="font-mono text-xs"
          />
          <Button
            onClick={handleInvestigate}
            disabled={phase === AiAnalysisPhase.THINKING || !prompt.trim()}
          >
            <Bot className="mr-1 size-4" />
            {UI_COPY.LOGS.AI.INVESTIGATE}
          </Button>
        </div>

        {phase === AiAnalysisPhase.THINKING && (
          <div className="panel space-y-1.5 p-4 font-mono text-xs">
            {investigationSteps.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "transition-opacity",
                  i < step
                    ? "text-primary"
                    : i === step
                      ? "text-foreground animate-pulse"
                      : "opacity-30",
                )}
              >
                {i < step ? "✓" : "›"} {s}
              </div>
            ))}
          </div>
        )}

        {phase === AiAnalysisPhase.ERROR && (
          <div className="panel text-error flex items-center gap-2 p-4 text-xs">
            <AlertCircle className="size-4 shrink-0" />
            <span>{UI_COPY.LOGS.AI.QUERY_FAILED}</span>
          </div>
        )}

        {phase === AiAnalysisPhase.DONE && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
            <AiSection icon={FileSearch} title={UI_COPY.LOGS.AI.BUFFER_CONTEXT}>
              Analyzed telemetry buffer contains <b>{bufferAnalysis.errorCount}</b>{" "}
              {UI_COPY.LOGS.AI.ERROR_COUNT}{" "}
              <b>{bufferAnalysis.topServices[0]?.[0] ?? UI_COPY.LOGS.AI.NO_MATCH}</b> (
              {bufferAnalysis.topServices[0]?.[1] ?? 0} {UI_COPY.LOGS.AI.ERROR_COUNT_SUFFIX}
            </AiSection>

            {matches.length > 0 ? (
              <>
                <AiSection icon={Target} title={UI_COPY.LOGS.AI.MATCHED_EPISODES}>
                  <div className="space-y-1.5">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-background/50 flex items-start gap-2 rounded border p-2 font-mono text-[11px]"
                      >
                        <span className="chip lvl-info shrink-0">
                          {(match.similarity * 100).toFixed(1)}
                          {UI_COPY.LOGS.AI.MATCH}
                        </span>
                        <span className="chip shrink-0">{match.service}</span>
                        <span className="flex-1">{match.summary}</span>
                        <span className="text-muted-foreground shrink-0 tabular-nums">
                          {new Date(match.log_timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </AiSection>

                <AiSection icon={Wrench} title={UI_COPY.LOGS.AI.REMEDIATION}>
                  <ol className="list-decimal space-y-1 pl-4 text-xs">
                    <li>
                      {UI_COPY.LOGS.AI.INSPECT_UPSTREAM(
                        matches[0]?.service ?? UI_COPY.LOGS.AI.NO_SERVICE,
                      )}
                    </li>
                    <li>{UI_COPY.LOGS.AI.VERIFY_TRACE}</li>
                    <li>{UI_COPY.LOGS.AI.ENABLE_RATE_LIMIT}</li>
                  </ol>
                </AiSection>
              </>
            ) : (
              <AiSection icon={Database} title={UI_COPY.LOGS.AI.VECTOR_RESULTS}>
                <p className="text-muted-foreground text-xs">{UI_COPY.LOGS.AI.NO_MATCHES}</p>
              </AiSection>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
