/**
 * @file packages/ui/src/icons/SpinnerIcon.tsx
 * @description Standardized SVG animated loading spinner icon primitive.
 * @module @devlab-logs/ui/icons/SpinnerIcon
 */

import React from "react";

export interface SpinnerIconProps extends React.SVGProps<SVGSVGElement> {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Clean SVG loading spinner icon with accessible presentation.
 */
export function SpinnerIcon({
  className = "dl-spinner",
  ...props
}: SpinnerIconProps): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle
        className="dl-spinner__track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        style={{ opacity: 0.25 }}
      />
      <path
        className="dl-spinner__head"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
        style={{ opacity: 0.75 }}
      />
    </svg>
  );
}
