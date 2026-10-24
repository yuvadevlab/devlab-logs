/**
 * @file apps/web/src/middleware.ts
 * @description Next.js Edge middleware enforcing session authentication guards across DevLab Logs.
 * @module @devlab/logs-web
 */

import { NextResponse, type NextRequest } from "next/server";
import { APP_ROUTES } from "./lib/constants/routes";

/** Public authentication routes accessible without an active session */
const AUTH_ROUTES = new Set<string>([
  APP_ROUTES.LOGIN,
  APP_ROUTES.FORGOT_PASSWORD,
  APP_ROUTES.RESET_PASSWORD,
]);

/**
 * Edge middleware intercepting requests to enforce active session cookies.
 *
 * @param request - Inbound Next.js HTTP request
 * @returns NextResponse redirecting unauthenticated or authenticated users appropriately
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. If returning from DevLab Portal SSO with token in query params
  const tokenParam =
    request.nextUrl.searchParams.get("token") || request.nextUrl.searchParams.get("access_token");

  if (tokenParam) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("token");
    cleanUrl.searchParams.delete("access_token");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set("devlab_access_token", tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    return response;
  }

  const tokenCookie = request.cookies.get("devlab_access_token");
  const isAuthenticated = Boolean(tokenCookie?.value && tokenCookie.value.trim().length > 0);

  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // 2. Unauthenticated users attempting to access protected observability console routes get redirected to /login
  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL(APP_ROUTES.LOGIN, request.url);
    // Preserve requested destination if deep-linking into subpages
    if (pathname !== APP_ROUTES.HOME) {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated users attempting to access /login, /forgot-password, etc. get redirected to destination or home
  if (isAuthenticated && isAuthRoute) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam && redirectParam !== APP_ROUTES.HOME) {
      try {
        return NextResponse.redirect(new URL(redirectParam, request.url));
      } catch {
        // Fallback
      }
    }
    const dashboardUrl = new URL(APP_ROUTES.HOME, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

/**
 * Configure path matching rules to exclude internal Next.js assets, static files, and public images.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (*.png, *.svg, *.jpg, *.jpeg, *.gif, *.webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
