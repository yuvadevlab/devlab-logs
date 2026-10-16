"use client";

import React from "react";
import { Bot, Database, Radio, AlertTriangle, X, Server } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@yuva-devlab/ui";
import { SERVICES, type ServiceName } from "../types";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchQuery: (query: string) => void;
  onOpenAi: () => void;
  onOpenSql: () => void;
  onToggleStream: () => void;
  onFilterErrors: () => void;
  onClearFilters: () => void;
  onSelectService: (service: ServiceName) => void;
}

/**
 * Global ⌘K Command Palette modal for quick actions and service filtering.
 */
export function CommandPalette({
  open,
  onOpenChange,
  onSearchQuery,
  onOpenAi,
  onOpenSql,
  onToggleStream,
  onFilterErrors,
  onClearFilters,
  onSelectService,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search logs or run a command…" onValueChange={onSearchQuery} />
      <CommandList>
        <CommandEmpty>Press enter to search messages.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onOpenAi();
            }}
          >
            <Bot className="text-ai mr-2 size-4" />
            Ask AI root-cause analysis
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onOpenSql();
            }}
          >
            <Database className="text-primary mr-2 size-4" />
            Open SQL workbench
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onToggleStream();
            }}
          >
            <Radio className="mr-2 size-4" />
            Toggle live stream
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onFilterErrors();
            }}
          >
            <AlertTriangle className="text-error mr-2 size-4" />
            Show only errors
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onClearFilters();
            }}
          >
            <X className="mr-2 size-4" />
            Clear all filters
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Services">
          {SERVICES.map((s) => (
            <CommandItem
              key={s}
              onSelect={() => {
                onOpenChange(false);
                onSelectService(s);
              }}
            >
              <Server className="mr-2 size-4" />
              {s}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
