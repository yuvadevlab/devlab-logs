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
  if (data === null) return <span className="dl-json-tree__muted">null</span>;
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
    <div className="dl-json-tree">
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
          <button type="button" onClick={() => setOpen(!open)} className="dl-json-tree__btn">
            <span className="dl-json-tree__arrow">{open ? "▾" : "▸"}</span>
            <span className="text-syn-key">{nodeKey}</span>
            <span className="dl-json-tree__muted">
              : {Array.isArray(value) ? `[${value.length}]` : "{…}"}
            </span>
          </button>
          {open && <JsonTree data={value} filter={filter} depth={depth + 1} />}
        </>
      ) : (
        <div>
          <span className="dl-json-tree__arrow" />
          <span className="text-syn-key">{nodeKey}</span>
          <span className="dl-json-tree__muted">: </span>
          <JsonTree data={value} />
        </div>
      )}
    </div>
  );
}
