/**
 * @file apps/web/src/middleware.ts
 * @description Next.js Edge middleware enforcing session authentication guards and DevLab SSO redirect.
 * Modeled after FinAI's centralized authentication architecture.
 * @module @devlab/logs-web
 */

import { NextResponse, type NextRequest } from "next/server";
import { DEVLAB_PORTAL_ROUTES } from "./lib/constants/routes";

/**
 * Edge middleware intercepting requests to enforce active session cookies.
 * Automatically delegates unauthenticated users to the DevLab Portal Central SSO login.
 *
 * @param request - Inbound Next.js HTTP request
 * @returns NextResponse redirecting unauthenticated or authenticated users appropriately
 */
export function middleware(request: NextRequest): NextResponse {
  // 1. If returning from DevLab Portal SSO with token in query params
  const tokenParam =
    request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("access_token");

  if (tokenParam) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("token");
    cleanUrl.searchParams.delete("access_token");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set("token", tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    response.cookies.set("devlab_access_token", tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    return response;
  }

  // 2. Validate token from cookies
  const token =
    request.cookies.get("token")?.value || request.cookies.get("devlab_access_token")?.value;

  if (!token) {
    return NextResponse.redirect(DEVLAB_PORTAL_ROUTES.LOGIN(request.url));
  }

  return NextResponse.next();
}

/**
 * Configure path matching rules to exclude internal Next.js assets, static files, and public routes.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth routes (login, register, forgot-password, reset-password)
     * - static asset files (containing a dot: .png, .jpg, .svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password|.*\\..*).*)",
  ],
};
