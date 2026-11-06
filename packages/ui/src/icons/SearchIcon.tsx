/**
 * @file packages/ui/src/icons/SearchIcon.tsx
 * @description Standardized SVG search icon primitive.
 * @module @devlab-logs/ui/icons/SearchIcon
 */

import React from "react";

export interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Clean SVG search icon.
 */
export function SearchIcon({
  className = "size-4 text-muted-foreground",
  ...props
}: SearchIconProps): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
