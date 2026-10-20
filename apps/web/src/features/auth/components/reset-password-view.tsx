"use client";

/**
 * @file apps/web/src/features/auth/components/reset-password-view.tsx
 * @description Interactive client view for setting account password via reset or invite token.
 * @module @devlab/logs-web/features/auth
 */

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APP_ROUTES } from "@/lib/constants/routes";
import { ResetPasswordForm } from "./reset-password-form";
import { UI_COPY } from "@/lib/ui-copy";

/**
 * Main interactive password reset view wrapped in Suspense boundary for Next.js searchParams.
 *
 * @returns React JSX element rendering the password reset container
 */
export const ResetPasswordView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          {UI_COPY.AUTH.RESET_PASSWORD.TITLE}
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          {UI_COPY.AUTH.RESET_PASSWORD.DESCRIPTION}
        </p>
      </div>

      <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
        <Suspense
          fallback={<div className="text-muted-foreground text-xs">{UI_COPY.COMMON.LOADING}</div>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>

      <div className="text-center">
        <Link
          href={APP_ROUTES.LOGIN}
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft className="size-3.5" />
          {UI_COPY.AUTH.RESET_PASSWORD.BACK_TO_SIGN_IN}
        </Link>
      </div>
    </div>
  );
};
