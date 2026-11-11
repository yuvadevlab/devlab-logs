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
  Badge,
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
      <DialogContent
        className="dl-ai-modal__dialog"
        style={{ maxHeight: "88vh", overflowY: "auto" }}
      >
        <DialogHeader>
          <DialogTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles className="dl-ai-modal__sparkle-icon" />
            Log-RAG Incident Investigation
          </DialogTitle>
          <DialogDescription>{UI_COPY.LOGS.AI.ASK_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvestigate()}
            placeholder={UI_COPY.LOGS.AI.PROMPT_PLACEHOLDER}
            className="dl-ai-modal__prompt-input"
          />
          <Button
            onClick={handleInvestigate}
            disabled={phase === AiAnalysisPhase.THINKING || !prompt.trim()}
          >
            <Bot className="dl-ai-modal__bot-icon" />
            {UI_COPY.LOGS.AI.INVESTIGATE}
          </Button>
        </div>

        {phase === AiAnalysisPhase.THINKING && (
          <div
            className="panel dl-ai-modal__code-panel"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
              padding: "1rem",
            }}
          >
            {investigationSteps.map((s, i) => (
              <div
                key={s}
                className={cn(i === step && "animate-pulse")}
                style={{
                  color: i < step ? "var(--primary)" : i === step ? "var(--foreground)" : undefined,
                  opacity: i > step ? 0.3 : 1,
                  transition: "opacity 150ms ease",
                }}
              >
                {i < step ? "✓" : "›"} {s}
              </div>
            ))}
          </div>
        )}

        {phase === AiAnalysisPhase.ERROR && (
          <div
            className="panel"
            style={{
              color: "var(--error)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem",
              fontSize: "0.75rem",
            }}
          >
            <AlertCircle className="dl-ai-modal__alert-icon" />
            <span>{UI_COPY.LOGS.AI.QUERY_FAILED}</span>
          </div>
        )}

        {phase === AiAnalysisPhase.DONE && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <AiSection icon={FileSearch} title={UI_COPY.LOGS.AI.BUFFER_CONTEXT}>
              Analyzed telemetry buffer contains <b>{bufferAnalysis.errorCount}</b>{" "}
              {UI_COPY.LOGS.AI.ERROR_COUNT}{" "}
              <b>{bufferAnalysis.topServices[0]?.[0] ?? UI_COPY.LOGS.AI.NO_MATCH}</b> (
              {bufferAnalysis.topServices[0]?.[1] ?? 0} {UI_COPY.LOGS.AI.ERROR_COUNT_SUFFIX}
            </AiSection>

            {matches.length > 0 ? (
              <>
                <AiSection icon={Target} title={UI_COPY.LOGS.AI.MATCHED_EPISODES}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="dl-ai-modal__meta-text"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          borderRadius: "0.375rem",
                          border: "1px solid var(--border)",
                          backgroundColor:
                            "color-mix(in oklab, var(--background) 50%, transparent)",
                          padding: "0.5rem",
                        }}
                      >
                        <Badge
                          variant="outline"
                          className="dl-ai-modal__badge"
                          style={{
                            borderColor: "color-mix(in oklab, var(--primary) 40%, transparent)",
                            backgroundColor: "color-mix(in oklab, var(--primary) 10%, transparent)",
                            color: "var(--primary)",
                          }}
                        >
                          {(match.similarity * 100).toFixed(1)}
                          {UI_COPY.LOGS.AI.MATCH}
                        </Badge>
                        <Badge variant="secondary" className="dl-ai-modal__badge">
                          {match.service}
                        </Badge>
                        <span style={{ flex: "1 1 0%" }}>{match.summary}</span>
                        <span
                          className="dl-ai-modal__badge--mono"
                          style={{
                            color: "var(--mutedForeground)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {new Date(match.log_timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </AiSection>

                <AiSection icon={Wrench} title={UI_COPY.LOGS.AI.REMEDIATION}>
                  <ol
                    className="dl-ai-modal__item-text"
                    style={{
                      listStyleType: "decimal",
                      paddingLeft: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      margin: 0,
                    }}
                  >
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
                <p style={{ color: "var(--mutedForeground)", fontSize: "0.75rem", margin: 0 }}>
                  {UI_COPY.LOGS.AI.NO_MATCHES}
                </p>
              </AiSection>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
