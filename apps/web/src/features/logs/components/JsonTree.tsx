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
    ? data.map((v, i) => [String(i), v] as const)
    : Object.entries(data as object);

  const f = filter.toLowerCase();
  const matches = (k: string, v: unknown): boolean =>
    !f ||
    k.toLowerCase().includes(f) ||
    (typeof v === "object" && v !== null && Object.entries(v).some(([kk, vv]) => matches(kk, vv)));

  return (
    <div className="font-mono text-xs leading-5">
      {entries
        .filter(([k, v]) => matches(k, v))
        .map(([k, v]) => (
          <JsonNode key={k} k={k} v={v} filter={filter} depth={depth} />
        ))}
    </div>
  );
}

function JsonNode({
  k,
  v,
  filter,
  depth,
}: {
  k: string;
  v: unknown;
  filter: string;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const isObject = typeof v === "object" && v !== null;

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
            <span className="text-syn-key">{k}</span>
            <span className="text-muted-foreground">
              : {Array.isArray(v) ? `[${(v as unknown[]).length}]` : "{…}"}
            </span>
          </button>
          {open && <JsonTree data={v} filter={filter} depth={depth + 1} />}
        </>
      ) : (
        <div>
          <span className="mr-1 inline-block w-3" />
          <span className="text-syn-key">{k}</span>
          <span className="text-muted-foreground">: </span>
          <JsonTree data={v} />
        </div>
      )}
    </div>
  );
}
