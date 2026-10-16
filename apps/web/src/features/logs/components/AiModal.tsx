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
} from "@yuva-devlab/ui";
import { cn } from "@/lib/utils";
import { LogLevel, AiAnalysisPhase, type LogEvent, type LogEpisodeMatch } from "../types";
import { useRagSearchMutation } from "../api/rag-search";
import { AiSection } from "./AiSection";

export interface AiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: LogEvent[];
}

const INVESTIGATION_STEPS = [
  "Generating query vector embeddings…",
  "Executing HNSW cosine similarity search…",
  "Correlating log episodes across services…",
  "Synthesizing incident root cause…",
];

/**
 * Natural language Log-RAG incident investigation modal.
 * Connects directly to DevLab Ingestion Gateway's vector similarity search.
 */
export function AiModal({ open, onOpenChange, logs }: AiModalProps) {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState(0);

  const ragMutation = useRagSearchMutation();

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
    INVESTIGATION_STEPS.forEach((_, i) => {
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
          <DialogDescription>
            Ask in plain English. Queries are embedded with Ollama and grounded in vector logs.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvestigate()}
            placeholder="e.g. database timeout or authentication failure…"
            className="font-mono text-xs"
          />
          <Button
            onClick={handleInvestigate}
            disabled={phase === AiAnalysisPhase.THINKING || !prompt.trim()}
          >
            <Bot className="mr-1 size-4" />
            Investigate
          </Button>
        </div>

        {phase === AiAnalysisPhase.THINKING && (
          <div className="panel space-y-1.5 p-4 font-mono text-xs">
            {INVESTIGATION_STEPS.map((s, i) => (
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
            <span>
              Failed to query Log-RAG vector embeddings. Ensure DevLab Ingestion Gateway is
              reachable.
            </span>
          </div>
        )}

        {phase === AiAnalysisPhase.DONE && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
            <AiSection icon={FileSearch} title="Buffer Telemetry Context">
              Analyzed telemetry buffer contains <b>{bufferAnalysis.errorCount}</b> error and fatal
              events. Primary impacted service:{" "}
              <b>{bufferAnalysis.topServices[0]?.[0] ?? "none"}</b> (
              {bufferAnalysis.topServices[0]?.[1] ?? 0} errors).
            </AiSection>

            {matches.length > 0 ? (
              <>
                <AiSection icon={Target} title="Matched Vector Episodes">
                  <div className="space-y-1.5">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-background/50 flex items-start gap-2 rounded border p-2 font-mono text-[11px]"
                      >
                        <span className="chip lvl-info shrink-0">
                          {(match.similarity * 100).toFixed(1)}% match
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

                <AiSection icon={Wrench} title="Remediation Protocol">
                  <ol className="list-decimal space-y-1 pl-4 text-xs">
                    <li>
                      Inspect upstream connection limits on {matches[0]?.service ?? "service"}.
                    </li>
                    <li>Verify trace correlation ID across service boundaries.</li>
                    <li>
                      Enable rate-limiting circuit breaker if traffic exceeds service threshold.
                    </li>
                  </ol>
                </AiSection>
              </>
            ) : (
              <AiSection icon={Database} title="Vector Search Results">
                <p className="text-muted-foreground text-xs">
                  No semantic episodes matched the query in the vector store. Ingest error logs with
                  Ollama embeddings enabled to populate the vector index.
                </p>
              </AiSection>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
