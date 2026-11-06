/**
 * @file apps/web/src/components/layout/AppNavbar.tsx
 * @description Master unified top navigation bar across all DevLab Logs routes.
 * Ensures pixel-perfect alignment, zero layout shift, and consistent responsive controls.
 * @module @devlab/logs-web/components/layout/AppNavbar
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Sparkles, Search, Layers } from "lucide-react";
import {
  Button,
  Badge,
  Separator,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@devlab-logs/ui";
import { UserButton } from "@yuva-devlab/auth-client";
import {
  Environment,
  StreamState,
  type TimeRangeKey,
  type TimeWindow,
} from "@/features/logs/types";
import { APP_ROUTES } from "@/lib/constants";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { NavbarExplorerControls } from "./NavbarExplorerControls";
import { EcosystemLauncher } from "./EcosystemLauncher";

export interface AppNavbarProps {
  env?: Environment;
  setEnv?: (env: Environment) => void;
  stream?: StreamState;
  onToggleStream?: () => void;
  eps?: number;
  bufferCount?: number;
  maxBuffer?: number;
  range?: TimeRangeKey;
  setRange?: (r: TimeRangeKey) => void;
  custom?: TimeWindow;
  setCustom?: React.Dispatch<React.SetStateAction<TimeWindow>>;
  autoScroll?: boolean;
  setAutoScroll?: (v: boolean | ((p: boolean) => boolean)) => void;
  onClearLogs?: () => void;
  onOpenSql?: () => void;
  onOpenCopilot?: () => void;
  onOpenCmd?: () => void;
}

export function AppNavbar({
  env = Environment.PRODUCTION,
  setEnv,
  stream = StreamState.LIVE,
  onToggleStream,
  eps = 0,
  bufferCount = 0,
  maxBuffer = 5000,
  range,
  setRange,
  custom,
  setCustom,
  autoScroll,
  setAutoScroll,
  onClearLogs,
  onOpenSql,
  onOpenCopilot,
  onOpenCmd,
}: AppNavbarProps) {
  const pathname = usePathname();
  const isExplorer = pathname === "/" || pathname === "";
  const isInvestigate = pathname.startsWith("/investigate");

  return (
    <nav className="border-border/60 bg-card/70 sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-3 backdrop-blur-md select-none sm:px-4">
      {/* Brand Identity & Primary Workspace Tabs */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link href={APP_ROUTES.HOME} className="flex shrink-0 items-center gap-2.5">
          <div className="bg-primary text-primary-foreground glow grid aspect-square size-8 shrink-0 place-items-center rounded-lg shadow-sm">
            <Activity className="size-4 shrink-0" strokeWidth={2.5} />
          </div>
          <div className="hidden shrink-0 leading-tight md:block">
            <div className="text-foreground text-xs font-semibold tracking-tight">
              {UI_COPY.COMMON.BRAND}
            </div>
            <div className="text-muted-foreground font-mono text-[9px]">
              {UI_COPY.COMMON.TELEMETRY_TAGLINE}
            </div>
          </div>
        </Link>

        <Separator orientation="vertical" className="hidden h-5 shrink-0 md:block" />

        <div className="hidden shrink-0 items-center gap-1 font-sans text-xs md:flex">
          <Link
            href={APP_ROUTES.HOME}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition",
              isExplorer
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                stream === StreamState.LIVE
                  ? "animate-pulse bg-emerald-500"
                  : "bg-muted-foreground",
              )}
            />
            <Layers className="size-3.5 shrink-0" />
            <span>Live Explorer</span>
          </Link>

          <Link
            href={APP_ROUTES.INVESTIGATE()}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition",
              isInvestigate
                ? "bg-primary/15 text-primary border-primary/30 border font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <Sparkles className="text-primary size-3.5 shrink-0" />
            <span>AI Investigator</span>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary px-1 py-0 font-mono text-[9px] leading-none"
            >
              RAG
            </Badge>
          </Link>
        </div>
      </div>

      {/* Right Controls: Explorer Tools, Env, Ecosystem Launcher, CmdK, Profile */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {isExplorer && (
          <NavbarExplorerControls
            stream={stream}
            onToggleStream={onToggleStream}
            eps={eps}
            bufferCount={bufferCount}
            maxBuffer={maxBuffer}
            range={range}
            setRange={setRange}
            custom={custom}
            setCustom={setCustom}
            autoScroll={autoScroll}
            setAutoScroll={setAutoScroll}
            onClearLogs={onClearLogs}
            onOpenSql={onOpenSql}
            onOpenCopilot={onOpenCopilot}
          />
        )}

        {setEnv && (
          <Select value={env} onValueChange={(val) => setEnv(val as Environment)}>
            <SelectTrigger className="h-7 w-[95px] shrink-0 font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Environment.PRODUCTION}>
                {UI_COPY.COMMON.ENVIRONMENT.PRODUCTION}
              </SelectItem>
              <SelectItem value={Environment.STAGING}>
                {UI_COPY.COMMON.ENVIRONMENT.STAGING}
              </SelectItem>
              <SelectItem value={Environment.DEVELOPMENT}>
                {UI_COPY.COMMON.ENVIRONMENT.DEVELOPMENT}
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* DevLab Ecosystem Applications Popover */}
        <EcosystemLauncher />

        {onOpenCmd && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCmd}
            className="text-muted-foreground hidden h-7 shrink-0 px-2 font-mono text-xs sm:flex"
            title="Search and commands (⌘K)"
          >
            <Search className="mr-1 size-3" />
            ⌘K
          </Button>
        )}

        <Separator orientation="vertical" className="h-5 shrink-0" />

        <div className="shrink-0">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
