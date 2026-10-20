"use client";

import type { ComponentType } from "react";

export interface KpiCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  sparkData?: number[];
  subtext?: string;
  badge?: { label: string; className: string };
  tone?: "error";
}

/**
 * Displays one dashboard KPI with an optional trend sparkline or supporting text.
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  sparkData,
  subtext,
  badge,
  tone,
}: KpiCardProps) {
  return (
    <div className="panel flex flex-col justify-between p-3">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {label}
        </span>
        {badge && <span className={`chip ${badge.className}`}>{badge.label}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={`font-mono text-2xl font-semibold tabular-nums ${tone === "error" ? "text-error" : ""}`}
        >
          {value}
        </span>
        <span className="text-muted-foreground text-xs">{unit}</span>
      </div>
      {sparkData ? (
        <Sparkline data={sparkData} tone={tone} />
      ) : (
        <div className="text-muted-foreground font-mono text-[11px]">{subtext}</div>
      )}
    </div>
  );
}

function Sparkline({ data, tone }: { data: number[]; tone?: "error" }) {
  const max = Math.max(1, ...data);
  const points = data
    .map((value, index) => `${(index / (data.length - 1)) * 100},${28 - (value / max) * 26}`)
    .join(" ");
  const colorClass = tone === "error" ? "text-error" : "text-primary";

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={`h-8 w-full ${colorClass}`}>
      <polyline points={`0,30 ${points} 100,30`} className="fill-current opacity-10" />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
