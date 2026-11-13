/**
 * @file apps/ingest/src/auth.ts
 * @description Authentication guards and token validation using @yuva-devlab/auth-server.
 * Enforces RS256 JWKS SSO tokens, M2M API keys, and service secrets.
 * @module @devlab/logs-ingest/auth
 */

import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { JwksValidator, M2mApiKeyValidator, DEFAULT_JWKS_PATH } from "@yuva-devlab/auth-server";

export type LogsPrincipal =
  | { kind: "service"; userId: string }
  | { kind: "user"; userId: string; tenantId: string; isSuperAdmin: boolean };

export { DEFAULT_JWKS_PATH };

const portalApiUrl = process.env.DEVLAB_PORTAL_API_URL || "http://localhost:4000";
const issuer = process.env.OIDC_ISSUER || "http://localhost:4000";

const jwksValidator = new JwksValidator({
  jwksUri: process.env.JWKS_URI || `${portalApiUrl}${DEFAULT_JWKS_PATH}`,
  issuer,
});

const m2mValidator = new M2mApiKeyValidator({
  portalUrl: portalApiUrl,
});

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

/**
 * Authenticates machine-to-machine log ingestion using a dedicated secret or DevLab Portal M2M key.
 */
export const requireLogIngestKey: RequestHandler = async (request, response, next) => {
  const token =
    bearerToken(request.header("authorization")) ||
    (request.header("x-api-key") as string | undefined);

  if (!token) {
    response.status(401).json({ error: "Missing log ingestion credentials." });
    return;
  }

  // 1. Direct environment ingest key
  const expectedKey = process.env.DEVLAB_LOGS_API_KEY;
  if (expectedKey && matchesSecret(token, expectedKey)) {
    next();
    return;
  }

  // 2. DevLab Portal registered M2M API Key (dlk_...)
  if (token.startsWith("dlk_")) {
    try {
      const validated = await m2mValidator.validateKey(token);
      if (validated.valid) {
        next();
        return;
      }
    } catch {
      // Fall through to 401
    }
  }

  response.status(401).json({ error: "Invalid or missing log ingestion credentials." });
};

/**
 * Authenticates read access through a read-only service key or DevLab Portal RS256 JWKS token.
 */
export const requireLogReadAccess: RequestHandler = async (request, response, next) => {
  const token = bearerToken(request.header("authorization"));
  if (!token) {
    response.status(401).json({ error: "Bearer authentication is required." });
    return;
  }

  // 1. Read-only service secret
  if (matchesSecret(token, process.env.DEVLAB_LOGS_READ_API_KEY)) {
    response.locals.logsPrincipal = {
      kind: "service",
      userId: "service_reader",
    } satisfies LogsPrincipal;
    next();
    return;
  }

  // 2. DevLab Portal SSO Token (verified via @yuva-devlab/auth-server JwksValidator)
  try {
    const payload = (await jwksValidator.verifyToken(token)) as Record<string, unknown>;
    const role = typeof payload.role === "string" ? payload.role : "";
    const isSuperAdmin = role === "super_admin";
    const tenantId = typeof payload.tenant_id === "string" ? payload.tenant_id : "";
    const userId =
      typeof payload.sub === "string"
        ? payload.sub
        : typeof payload.user_id === "string"
          ? payload.user_id
          : "system_user";

    if (payload.type !== "user_session" || (!tenantId && !isSuperAdmin)) {
      response.status(403).json({ error: "This identity cannot access log data." });
      return;
    }

    response.locals.logsPrincipal = {
      kind: "user",
      userId,
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
    return {
      kind: "service",
      userId:
        "userId" in principal && typeof principal.userId === "string"
          ? principal.userId
          : "service_reader",
    };
  }
  if (
    principal.kind === "user" &&
    "tenantId" in principal &&
    typeof principal.tenantId === "string" &&
    "userId" in principal &&
    typeof principal.userId === "string" &&
    "isSuperAdmin" in principal &&
    typeof principal.isSuperAdmin === "boolean"
  ) {
    return {
      kind: "user",
      userId: principal.userId,
      tenantId: principal.tenantId,
      isSuperAdmin: principal.isSuperAdmin,
    };
  }
  throw new Error("Authenticated log principal is invalid.");
}
