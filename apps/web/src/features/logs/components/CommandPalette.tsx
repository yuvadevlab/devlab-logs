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
} from "@devlab-logs/ui";
import { SERVICES, type ServiceName } from "../types";
import { UI_COPY } from "@/lib/ui-copy";

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
      <CommandInput
        placeholder={UI_COPY.LOGS.COMMAND_PALETTE.SEARCH_PLACEHOLDER}
        onValueChange={onSearchQuery}
      />
      <CommandList>
        <CommandEmpty>{UI_COPY.LOGS.COMMAND_PALETTE.EMPTY}</CommandEmpty>
        <CommandGroup heading={UI_COPY.LOGS.COMMAND_PALETTE.ACTIONS}>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onOpenAi();
            }}
          >
            <Bot className="text-ai mr-2 size-4" />
            {UI_COPY.LOGS.COMMAND_PALETTE.ASK_AI}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onOpenSql();
            }}
          >
            <Database className="text-primary mr-2 size-4" />
            {UI_COPY.LOGS.COMMAND_PALETTE.OPEN_SQL}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onToggleStream();
            }}
          >
            <Radio className="mr-2 size-4" />
            {UI_COPY.LOGS.COMMAND_PALETTE.TOGGLE_STREAM}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onFilterErrors();
            }}
          >
            <AlertTriangle className="text-error mr-2 size-4" />
            {UI_COPY.LOGS.COMMAND_PALETTE.SHOW_ERRORS}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onClearFilters();
            }}
          >
            <X className="mr-2 size-4" />
            {UI_COPY.LOGS.COMMAND_PALETTE.CLEAR_FILTERS}
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={UI_COPY.LOGS.COMMAND_PALETTE.SERVICES}>
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
