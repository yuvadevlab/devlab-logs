/**
 * @file packages/ui/src/components/SearchBar.tsx
 * @description Standardized search bar component modeled after FinAI.
 * Encapsulates design-system Input with startIcon to ensure the icon and placeholder never collapse.
 * @module @devlab-logs/ui/components/SearchBar
 */

import React from "react";
import { Input, type InputProps } from "@yuva-devlab/ui";

export interface SearchBarProps extends InputProps {
  /** Optional wrapper container class */
  containerClassName?: string;
}

const DefaultSearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground size-4"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

/**
 * Accessible search input wrapper ensuring proper icon alignment and text indent.
 */
export function SearchBar({
  className,
  containerClassName,
  startIcon,
  ...props
}: SearchBarProps): React.JSX.Element {
  return (
    <div className={containerClassName}>
      <Input
        type="search"
        startIcon={startIcon ?? <DefaultSearchIcon />}
        className={className}
        {...props}
      />
    </div>
  );
}
