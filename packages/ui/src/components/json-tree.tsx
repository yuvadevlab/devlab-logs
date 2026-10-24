"use client";

import React, { useState } from "react";

export interface JsonTreeProps {
  data: unknown;
  filter?: string;
  depth?: number;
}

/**
 * Interactive collapsible JSON tree with key-based filtering and syntax tokens.
 */
export function JsonTree({ data, filter = "", depth = 0 }: JsonTreeProps) {
  if (data === null) return <span className="text-muted-foreground">null</span>;
  if (typeof data === "string") return <span className="text-syn-str">"{data}"</span>;
  if (typeof data === "number" || typeof data === "boolean") {
    return <span className="text-syn-num">{String(data)}</span>;
  }

  const entries = Array.isArray(data)
    ? data.map((value, index) => [String(index), value] as const)
    : Object.entries(data as object);

  const normalizedFilter = filter.toLowerCase();
  const matches = (key: string, value: unknown): boolean =>
    !normalizedFilter ||
    key.toLowerCase().includes(normalizedFilter) ||
    (typeof value === "object" &&
      value !== null &&
      Object.entries(value).some(([nestedKey, nestedValue]) => matches(nestedKey, nestedValue)));

  return (
    <div className="font-mono text-xs leading-5">
      {entries
        .filter(([key, value]) => matches(key, value))
        .map(([key, value]) => (
          <JsonNode key={key} nodeKey={key} value={value} filter={filter} depth={depth} />
        ))}
    </div>
  );
}

interface JsonNodeProps {
  nodeKey: string;
  value: unknown;
  filter: string;
  depth: number;
}

function JsonNode({ nodeKey, value, filter, depth }: JsonNodeProps) {
  const [open, setOpen] = useState(true);
  const isObject = typeof value === "object" && value !== null;

  return (
    <div style={{ paddingLeft: depth ? 14 : 0 }}>
      {isObject ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-left hover:opacity-80"
          >
            <span className="text-muted-foreground mr-1 inline-block w-3">{open ? "▾" : "▸"}</span>
            <span className="text-syn-key">{nodeKey}</span>
            <span className="text-muted-foreground">
              : {Array.isArray(value) ? `[${value.length}]` : "{…}"}
            </span>
          </button>
          {open && <JsonTree data={value} filter={filter} depth={depth + 1} />}
        </>
      ) : (
        <div>
          <span className="mr-1 inline-block w-3" />
          <span className="text-syn-key">{nodeKey}</span>
          <span className="text-muted-foreground">: </span>
          <JsonTree data={value} />
        </div>
      )}
    </div>
  );
}
