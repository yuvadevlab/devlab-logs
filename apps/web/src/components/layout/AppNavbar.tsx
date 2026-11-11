/**
 * @file apps/web/src/components/layout/AppNavbar.tsx
 * @description Master unified top navigation bar mounted centrally in the dashboard shell.
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
import { useExplorerContext } from "@/features/logs";
import { Environment, StreamState } from "@/features/logs/types";
import { APP_ROUTES } from "@/lib/constants";
import { UI_COPY } from "@/lib/ui-copy";
import { cn } from "@/lib/utils";
import { NavbarExplorerControls } from "./NavbarExplorerControls";
import { EcosystemLauncher } from "./EcosystemLauncher";

export interface AppNavbarProps {
  env?: Environment;
  setEnv?: (env: Environment) => void;
  onOpenCmd?: () => void;
}

export function AppNavbar(props?: AppNavbarProps) {
  const pathname = usePathname();
  const explorer = useExplorerContext();

  const isExplorer = pathname === "/" || pathname === "";
  const isInvestigate = pathname.startsWith("/investigate");

  const env = props?.env ?? explorer.env;
  const setEnv = props?.setEnv ?? explorer.setEnv;
  const onOpenCmd = props?.onOpenCmd ?? (() => explorer.setCmdOpen(true));
  const stream = explorer.stream;

  return (
    <nav className="dl-navbar">
      {/* Brand Identity & Primary Workspace Tabs */}
      <div className="dl-navbar__brand-group">
        <Link href={APP_ROUTES.HOME} className="dl-navbar__brand-link">
          <div className="dl-navbar__brand-logo">
            <Activity className="dl-navbar__brand-icon" strokeWidth={2.5} />
          </div>
          <div className="dl-navbar__brand-meta">
            <div className="dl-navbar__brand-title">{UI_COPY.COMMON.BRAND}</div>
            <div className="dl-navbar__brand-tagline">{UI_COPY.COMMON.TELEMETRY_TAGLINE}</div>
          </div>
        </Link>

        <Separator orientation="vertical" className="dl-navbar__separator--desktop" />

        <div className="dl-navbar__tabs">
          <Link
            href={APP_ROUTES.HOME}
            className={cn("dl-navbar__tab-link", isExplorer && "dl-navbar__tab-link--active")}
          >
            <span
              className={cn(
                "dl-navbar__indicator",
                stream === StreamState.LIVE && "dl-navbar__indicator--live",
              )}
            />
            <Layers className="dl-navbar__tab-icon" />
            <span>{UI_COPY.COMMON.NAVIGATION.LIVE_EXPLORER}</span>
          </Link>

          <Link
            href={APP_ROUTES.INVESTIGATE()}
            className={cn(
              "dl-navbar__tab-link",
              isInvestigate && "dl-navbar__tab-link--investigate",
            )}
          >
            <Sparkles className="dl-navbar__tab-icon" />
            <span>{UI_COPY.COMMON.NAVIGATION.AI_INVESTIGATOR}</span>
            <Badge variant="outline" className="dl-navbar__rag-badge">
              {UI_COPY.COMMON.NAVIGATION.RAG_BADGE}
            </Badge>
          </Link>
        </div>
      </div>

      {/* Right Controls: Explorer Tools, Env, Ecosystem Launcher, CmdK, Profile */}
      <div className="dl-navbar__controls">
        {isExplorer && (
          <div className="dl-navbar__explorer-wrapper">
            <NavbarExplorerControls />
          </div>
        )}

        <Select value={env} onValueChange={(val) => setEnv(val as Environment)}>
          <SelectTrigger className="dl-navbar__select-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="dl-navbar__select-content">
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

        {/* DevLab Ecosystem Applications Popover */}
        <EcosystemLauncher />

        <div className="dl-navbar__cmd-wrapper">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCmd}
            className="dl-navbar__cmd-btn"
            title={UI_COPY.COMMON.ACTIONS.SEARCH_AND_COMMANDS}
          >
            <Search className="dl-navbar__cmd-icon" />
            {UI_COPY.COMMON.ACTIONS.COMMAND_PALETTE}
          </Button>
        </div>

        <Separator orientation="vertical" className="dl-navbar__separator" />

        <div className="dl-navbar__user-wrapper">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
