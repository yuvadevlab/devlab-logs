/**
 * @file apps/web/src/lib/jwt.ts
 * @description Lightweight, environment-agnostic JWT decoder and preemptive expiry validator.
 * Operates across Next.js Edge runtime, Node.js SSR, and browser client without native crypto dependencies.
 * @module @devlab/logs-web/lib/jwt
 */

/** Canonical claims present in portal RS256/JWT authentication payloads */
export interface JwtClaims {
  sub?: string;
  exp?: number;
  iat?: number;
  email?: string;
  role?: string;
  tenant_id?: string;
  [key: string]: unknown;
}

/**
 * Decodes base64url encoded string safely across browser and server runtimes.
 *
 * @param input - Base64 or Base64URL encoded string
 * @returns Decoded UTF-8 string
 */
export function decodeBase64(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLength, "=");
  const binary = atob(padded);
  return decodeURIComponent(
    binary
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
}

/**
 * Parses JWT payload without cryptographic signature verification.
 * Used for preemptive Edge middleware and client-side token lifetime inspection.
 *
 * @param token - Raw JWT string
 * @returns Decoded payload claims, or null if token is malformed
 */
export function parseJwtClaims(token: string): JwtClaims | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.trim().split(".");
  const payloadPart = parts[1];
  if (parts.length !== 3 || !payloadPart) {
    return null;
  }

  try {
    const jsonPayload = decodeBase64(payloadPart);
    return JSON.parse(jsonPayload) as JwtClaims;
  } catch {
    return null;
  }
}

/**
 * Checks whether a JWT token is missing, corrupted, or past its expiration window.
 *
 * @param token - Raw JWT string or undefined
 * @param bufferSeconds - Safety buffer in seconds to prevent clock skew race conditions (default: 10s)
 * @returns True if token is missing, invalid, or expired; false if actively valid
 */
export function isJwtExpired(token?: string | null, bufferSeconds = 10): boolean {
  if (!token) {
    return true;
  }

  const claims = parseJwtClaims(token);
  if (!claims || typeof claims.exp !== "number") {
    return true;
  }

  const currentEpochSeconds = Math.floor(Date.now() / 1000);
  return claims.exp <= currentEpochSeconds + bufferSeconds;
}
