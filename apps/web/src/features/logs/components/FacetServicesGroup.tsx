/**
 * @file apps/web/src/features/logs/components/FacetServicesGroup.tsx
 * @description Microservice facet filter category list and isolation controls.
 * @author yuva.devlab@gmail.com
 */

"use client";

import React from "react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceName } from "../types";

export interface FacetServicesGroupProps {
  filteredServices: [string, number][];
  services: ServiceName[];
  toggleService: (s: ServiceName) => void;
  isolateService: (s: string, e: React.MouseEvent) => void;
  clearServices: () => void;
}

export function FacetServicesGroup({
  filteredServices,
  services,
  toggleService,
  isolateService,
  clearServices,
}: FacetServicesGroupProps): React.JSX.Element {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.25rem 0.375rem",
          fontSize: "0.625rem",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--mutedForeground)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Layers className="dl-facets__category-icon" style={{ color: "var(--primary)" }} />
          Services ({filteredServices.length})
        </span>
        {services.length > 0 && (
          <button
            type="button"
            onClick={clearServices}
            style={{
              color: "var(--primary)",
              cursor: "pointer",
              textTransform: "lowercase",
              background: "none",
              border: "none",
              padding: 0,
            }}
            className="dl-facets__reset-btn"
          >
            reset
          </button>
        )}
      </div>
      <div
        style={{
          marginTop: "0.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
        }}
      >
        {filteredServices.map(([svc, count]) => {
          const isSelected = services.includes(svc as ServiceName);
          return (
            <div
              key={svc}
              onClick={() => toggleService(svc as ServiceName)}
              className={cn("dl-facets__item", isSelected && "dl-facets__item--active")}
            >
              <span
                style={{
                  maxWidth: "130px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {svc}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <button
                  type="button"
                  onClick={(e) => isolateService(svc, e)}
                  title="Only"
                  className="dl-facets__only-btn"
                >
                  only
                </button>
                <span
                  style={{
                    color: "var(--mutedForeground)",
                    fontSize: "0.625rem",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
