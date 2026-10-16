"use client";

/**
 * @file apps/web/src/features/auth/components/reset-password-form.tsx
 * @description Internal interactive form component for password reset token submission.
 * @module @devlab/logs-web/features/auth
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@yuva-devlab/ui";
import { APP_ROUTES, API_ROUTES } from "@/lib/constants/routes";

/**
 * Interactive form handling token extraction, validation, and password reset dispatch.
 *
 * @returns React JSX element rendering the reset input form
 */
export function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const isWelcome = searchParams.get("welcome") === "true";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate token presence
    if (!token.trim()) {
      setErrorMessage("Reset or onboarding token is required.");
      return;
    }

    // Minimum password security length
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    // Confirmation matching check
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_GATEWAY_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3015";
      const res = await fetch(`${apiBase}${API_ROUTES.AUTH_RESET_PASSWORD}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword: password }),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || "Reset failed. The token may have expired.");
      }

      setDone(true);
      setTimeout(() => router.push(APP_ROUTES.LOGIN), 2500);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-success/15 text-success mx-auto flex size-14 items-center justify-center rounded-full">
          <CheckCircle2 className="size-7" />
        </div>
        <div>
          <h3 className="text-foreground text-base font-semibold">
            Password updated successfully!
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">Redirecting you to login…</p>
        </div>
        <Button asChild className="w-full">
          <Link href={APP_ROUTES.LOGIN}>Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {!tokenFromUrl && (
        <div className="space-y-1.5">
          <Label htmlFor="token" className="text-xs font-semibold">
            Token
          </Label>
          <Input
            id="token"
            type="text"
            placeholder="Paste your reset token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
            className="h-9 font-mono text-xs"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold">
          {isWelcome ? "Create Password" : "New Password"}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-semibold">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className="h-9 text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground mt-2 w-full text-xs font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            Updating password…
          </>
        ) : (
          <>
            <Lock className="mr-1.5 size-3.5" />
            {isWelcome ? "Set Password & Complete Setup" : "Reset Password"}
          </>
        )}
      </Button>
    </form>
  );
}
