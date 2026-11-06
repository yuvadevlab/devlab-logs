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
    url: "http://localhost:8085",
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
          className="size-8 shrink-0"
          title="DevLab Ecosystem Applications"
          aria-label="DevLab Ecosystem Applications"
        >
          <Grid2X2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 shadow-xl" align="end" sideOffset={8}>
        {/* Responsive Workspace Views (Shown on small viewports where topbar tabs collapse) */}
        <div className="mb-2.5 block md:hidden">
          <div className="text-muted-foreground mb-1.5 px-1 font-mono text-[10px] font-semibold tracking-wider uppercase">
            Workspace Views
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-sans">
            <Link
              href={APP_ROUTES.HOME}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md border p-2 text-xs transition",
                isExplorer
                  ? "bg-accent border-primary/40 font-semibold"
                  : "border-border/60 hover:bg-accent/60",
              )}
            >
              <Layers className="size-3.5 text-emerald-500" />
              <span>Live Explorer</span>
            </Link>
            <Link
              href={APP_ROUTES.INVESTIGATE()}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md border p-2 text-xs transition",
                isInvestigate
                  ? "bg-accent border-primary/40 font-semibold"
                  : "border-border/60 hover:bg-accent/60",
              )}
            >
              <Sparkles className="text-primary size-3.5" />
              <span>AI Investigator</span>
            </Link>
          </div>
          <Separator className="mt-2.5" />
        </div>

        {/* Ecosystem Applications Catalog */}
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-muted-foreground font-mono text-[10px] font-semibold tracking-wider uppercase">
            DevLab Ecosystem
          </span>
          <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
            {DEVLAB_APPS.length}
          </Badge>
        </div>

        <div className="mt-1.5 grid grid-cols-2 gap-2">
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
                  "border-border/60 hover:border-primary/40 hover:bg-accent group relative flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border p-2 text-center transition-all duration-150",
                  app.isCurrent && "border-primary/50 bg-primary/5 ring-primary/20 ring-1",
                )}
                title={`${app.name} (${app.url})`}
              >
                {app.isCurrent && (
                  <span className="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full" />
                )}
                <div
                  className={cn(
                    "mb-1 grid size-7 place-items-center rounded-md transition-transform group-hover:scale-105",
                    app.isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <span className="text-foreground w-full truncate text-[11px] font-medium">
                  {app.name}
                </span>
                <span className="text-muted-foreground w-full truncate font-mono text-[9px]">
                  {app.sub}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
