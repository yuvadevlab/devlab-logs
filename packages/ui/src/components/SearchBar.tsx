/**
 * @file packages/ui/src/components/SearchBar.tsx
 * @description Standardized search bar component modeled after FinAI.
 * Encapsulates design-system Input with startIcon to ensure the icon and placeholder never collapse.
 * @module @devlab-logs/ui/components/SearchBar
 */

import React from "react";
import { Input, type InputProps } from "@yuva-devlab/ui";
import { SearchIcon } from "../icons";

export interface SearchBarProps extends InputProps {
  /** Optional wrapper container class */
  containerClassName?: string;
}

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
        startIcon={startIcon ?? <SearchIcon />}
        className={className}
        {...props}
      />
    </div>
  );
}
