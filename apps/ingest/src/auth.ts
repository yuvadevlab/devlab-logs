import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

export type LogsPrincipal =
  { kind: "service" } | { kind: "user"; tenantId: string; isSuperAdmin: boolean };

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function matchesSecret(candidate: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

function bearerToken(header: string | undefined): string | undefined {
  const match = header?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1];
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

/**
 * Authenticates machine-to-machine log ingestion using a dedicated bearer secret.
 */
export const requireLogIngestKey: RequestHandler = (request, response, next) => {
  const expectedKey = process.env.DEVLAB_LOGS_API_KEY;
  if (!expectedKey) {
    response.status(503).json({ error: "Log ingestion is not configured." });
    return;
  }

  const token = bearerToken(request.header("authorization"));
  if (!token || !matchesSecret(token, expectedKey)) {
    response.status(401).json({ error: "Invalid or missing log ingestion credentials." });
    return;
  }

  next();
};

/**
 * Authenticates read access through a read-only service key or a Portal-issued SSO token.
 */
export const requireLogReadAccess: RequestHandler = async (request, response, next) => {
  const token = bearerToken(request.header("authorization"));
  if (!token) {
    response.status(401).json({ error: "Bearer authentication is required." });
    return;
  }

  if (matchesSecret(token, process.env.DEVLAB_LOGS_READ_API_KEY)) {
    response.locals.logsPrincipal = { kind: "service" } satisfies LogsPrincipal;
    next();
    return;
  }

  const portalApiUrl = process.env.DEVLAB_PORTAL_API_URL;
  const issuer = process.env.OIDC_ISSUER;
  if (!portalApiUrl || !issuer) {
    response.status(503).json({ error: "Portal token verification is not configured." });
    return;
  }

  try {
    remoteJwks ??= createRemoteJWKSet(
      new URL(".well-known/jwks.json", ensureTrailingSlash(portalApiUrl)),
    );
    const { payload } = await jwtVerify(token, remoteJwks, {
      issuer,
      algorithms: ["RS256"],
    });
    const role = typeof payload.role === "string" ? payload.role : "";
    const isSuperAdmin = role === "super_admin";
    const tenantId = typeof payload.tenant_id === "string" ? payload.tenant_id : "";

    if (payload.type !== "user_session" || (!tenantId && !isSuperAdmin)) {
      response.status(403).json({ error: "This identity cannot access log data." });
      return;
    }

    response.locals.logsPrincipal = {
      kind: "user",
      tenantId,
      isSuperAdmin,
    } satisfies LogsPrincipal;
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired Portal authentication token." });
  }
};

/**
 * Reads the authenticated principal attached by the log read middleware.
 */
export function getLogsPrincipal(principal: unknown): LogsPrincipal {
  if (!principal || typeof principal !== "object" || !("kind" in principal)) {
    throw new Error("Authenticated log principal is missing from the request.");
  }
  if (principal.kind === "service") {
    return { kind: "service" };
  }
  if (
    principal.kind === "user" &&
    "tenantId" in principal &&
    typeof principal.tenantId === "string" &&
    "isSuperAdmin" in principal &&
    typeof principal.isSuperAdmin === "boolean"
  ) {
    return {
      kind: "user",
      tenantId: principal.tenantId,
      isSuperAdmin: principal.isSuperAdmin,
    };
  }
  throw new Error("Authenticated log principal is invalid.");
}
