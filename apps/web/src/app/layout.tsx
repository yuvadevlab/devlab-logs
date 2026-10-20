/**
 * @file apps/web/src/app/layout.tsx
 * @description Root SSR layout for DevLab Logs Observability Studio.
 * Integrates DevLab Design System ThemeProvider, AuthProvider, and TanStack Query.
 * @module @devlab/logs-web
 */

import React from "react";
import type { Metadata } from "next";
import { ConfigProvider, Toaster } from "@devlab-logs/ui";
import { QueryProvider, AuthProvider } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLab Logs — Real-time Telemetry & Log Analytics",
  description:
    "Live distributed log streaming, trace inspection, DuckDB SQL analytics, and Log-RAG root-cause analysis.",
  openGraph: {
    title: "DevLab Logs — Real-time Telemetry & Log Analytics",
    description:
      "Live distributed log streaming, trace inspection, DuckDB SQL analytics, and Log-RAG root-cause analysis.",
    type: "website",
  },
};

/**
 * Root SSR layout wrapper for DevLab Logs Observability Studio.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      data-brand="logs"
      data-theme="logs-dark"
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen font-sans antialiased">
        <ConfigProvider brand="logs" defaultTheme="dark" storageKey="devlab-logs-theme">
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
