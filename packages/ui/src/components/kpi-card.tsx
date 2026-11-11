"use client";

import type { ComponentType } from "react";
import { Sparkline } from "../icons";

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
    <div className="panel dl-kpi-card">
      <div className="dl-kpi-card__header">
        <span className="dl-kpi-card__label-wrap">
          <Icon className="dl-search-icon" />
          {label}
        </span>
        {badge && <span className={`chip ${badge.className}`}>{badge.label}</span>}
      </div>
      <div className="dl-kpi-card__value-wrap">
        <span
          className={`dl-kpi-card__value ${tone === "error" ? "dl-kpi-card__value--error" : ""}`}
        >
          {value}
        </span>
        <span className="dl-kpi-card__unit">{unit}</span>
      </div>
      {sparkData ? (
        <Sparkline data={sparkData} tone={tone} />
      ) : (
        <div className="dl-kpi-card__subtext">{subtext}</div>
      )}
    </div>
  );
}
