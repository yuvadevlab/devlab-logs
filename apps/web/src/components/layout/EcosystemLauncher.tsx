/**
 * @file apps/web/src/components/layout/EcosystemLauncher.tsx
 * @description Ecosystem App Launcher popover grid modeled after DevLab Portal's header actions.
 * Provides unified cross-app navigation across all DevLab applications and responsive navigation on small screens.
 * @module @devlab/logs-web/components/layout/EcosystemLauncher
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid2X2,
  Layers,
  TrendingUp,
  Workflow,
  Terminal,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button, Badge, Popover, PopoverTrigger, PopoverContent, Separator } from "@devlab-logs/ui";
import { APP_ROUTES } from "@/lib/constants";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";

/** Ecosystem application metadata */
interface EcosystemAppItem {
  id: string;
  name: string;
  sub: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isCurrent?: boolean;
}

const DEVLAB_APPS: readonly EcosystemAppItem[] = [
  {
    id: "portal",
    name: "DevLab Portal",
    sub: "Control plane",
    url: "http://localhost:3000",
    icon: Layers,
  },
  {
    id: "finai",
    name: "FinAI",
    sub: "Finance AI",
    url: "http://localhost:3001",
    icon: TrendingUp,
  },
  {
    id: "orchestrai",
    name: "OrchestrAI",
    sub: "Agent swarm",
    url: "http://localhost:3002",
    icon: Workflow,
  },
  {
    id: "devlab-logs",
    name: "DevLab Logs",
    sub: "Telemetry",
    url: "http://localhost:3003",
    icon: Terminal,
    isCurrent: true,
  },
  {
    id: "vitalai",
    name: "VitalAI",
    sub: "Health AI",
    url: "http://localhost:3004",
    icon: HeartPulse,
  },
  {
    id: "devlab-guard",
    name: "DevLab Guard",
    sub: "Zero-trust",
    url: "http://localhost:8000",
    icon: ShieldCheck,
  },
  {
    id: "incidentai",
    name: "IncidentAI",
    sub: "Remediation",
    url: "http://localhost:8001",
    icon: AlertTriangle,
  },
] as const;

/**
 * Ecosystem launcher button with popover listing all DevLab suite applications.
 * Automatically displays workspace routes when viewport is small.
 */
export function EcosystemLauncher(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isExplorer = pathname === "/" || pathname === "";
  const isInvestigate = pathname.startsWith("/investigate");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="dl-launcher__trigger-btn"
          title={UI_COPY.COMMON.ECOSYSTEM.TITLE}
          aria-label={UI_COPY.COMMON.ECOSYSTEM.TITLE}
        >
          <Grid2X2 className="dl-launcher__trigger-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        avoidCollisions={false}
        className="dl-launcher__popover"
      >
        {/* Responsive Workspace Views (Shown on small viewports where topbar tabs collapse) */}
        <div className="dl-launcher__views">
          <div className="dl-launcher__section-title">{UI_COPY.COMMON.ECOSYSTEM.SECTION_VIEWS}</div>
          <div className="dl-launcher__views-grid">
            <Link
              href={APP_ROUTES.HOME}
              onClick={() => setOpen(false)}
              className={cn(
                "dl-launcher__view-link",
                isExplorer && "dl-launcher__view-link--active",
              )}
            >
              <Layers className="dl-launcher__view-icon dl-launcher__view-icon--explorer" />
              <span>{UI_COPY.COMMON.NAVIGATION.LIVE_EXPLORER}</span>
            </Link>
            <Link
              href={APP_ROUTES.INVESTIGATE()}
              onClick={() => setOpen(false)}
              className={cn(
                "dl-launcher__view-link",
                isInvestigate && "dl-launcher__view-link--active",
              )}
            >
              <Sparkles className="dl-launcher__view-icon dl-launcher__view-icon--investigate" />
              <span>{UI_COPY.COMMON.NAVIGATION.AI_INVESTIGATOR}</span>
            </Link>
          </div>
          <Separator className="dl-launcher__separator" />
        </div>

        {/* Ecosystem Applications Catalog */}
        <div className="dl-launcher__header">
          <span className="dl-launcher__section-title" style={{ marginBottom: 0 }}>
            {UI_COPY.COMMON.ECOSYSTEM.SECTION_APPS}
          </span>
          <Badge variant="secondary" className="dl-launcher__badge">
            {DEVLAB_APPS.length}
          </Badge>
        </div>

        <div className="dl-launcher__grid">
          {DEVLAB_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  if (!app.isCurrent) {
                    window.open(app.url, "_blank", "noopener,noreferrer");
                  }
                  setOpen(false);
                }}
                className={cn(
                  "dl-launcher__app-card",
                  app.isCurrent && "dl-launcher__app-card--current",
                )}
                title={`${app.name} (${app.url})`}
              >
                {app.isCurrent && <span className="dl-launcher__app-dot" />}
                <div className="dl-launcher__app-icon">
                  <Icon className="dl-launcher__app-glyph" />
                </div>
                <span className="dl-launcher__app-name">{app.name}</span>
                <span className="dl-launcher__app-sub">{app.sub}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
