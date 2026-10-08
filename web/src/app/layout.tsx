import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLab Telemetry Studio | Distributed Observability",
  description: "Enterprise Real-Time Multi-Stream Observability, Waterfall Logs & AI Log-RAG Platform",
};

/**
 * Root application shell layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
