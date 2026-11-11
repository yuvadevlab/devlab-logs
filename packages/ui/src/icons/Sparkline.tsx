/**
 * @file packages/ui/src/icons/Sparkline.tsx
 * @description Lightweight SVG sparkline mini-chart for KPI trendlines.
 * @module @devlab-logs/ui/icons/Sparkline
 */

import React from "react";

export interface SparklineProps {
  /** Array of numerical values defining the trend curve */
  readonly data: number[];
  /** Optional visual tone variant */
  readonly tone?: "error";
  /** Optional CSS class name */
  readonly className?: string;
}

/**
 * Responsive vectorized SVG sparkline.
 */
export function Sparkline({ data, tone, className }: SparklineProps): React.JSX.Element {
  const max = Math.max(1, ...data);
  const points = data
    .map((value, index) => `${(index / (data.length - 1)) * 100},${28 - (value / max) * 26}`)
    .join(" ");
  const colorClass = tone === "error" ? "dl-sparkline--error" : "dl-sparkline--primary";

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className={`dl-sparkline ${colorClass} ${className ?? ""}`}
      aria-hidden="true"
    >
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
