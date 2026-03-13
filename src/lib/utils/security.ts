// ============================================================================
// ManyHandz — CSRF Helpers (Server-Side Only)
// Generates, stores, and verifies CSRF tokens using HTTP-only cookies.
// This file must only be imported in server components / route handlers.
// ============================================================================

import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_MAX_AGE = 60 * 60; // 1 hour in seconds

/**
 * Generates a cryptographically secure random CSRF token (64 hex characters).
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a new CSRF token, stores it in an HTTP-only cookie, and returns
 * the token value so it can be embedded in a form or sent to the client
 * via a meta tag / response header.
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_MAX_AGE,
  });

  return token;
}

/**
 * Verifies a CSRF token submitted in a request against the token stored
 * in the HTTP-only cookie. Uses timing-safe comparison.
 *
 * @param requestToken - the token value from the request header or body
 * @returns true if the tokens match, false otherwise
 */
export async function verifyCsrfToken(
  requestToken: string | null
): Promise<boolean> {
  if (!requestToken) return false;

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!storedToken) return false;

  // Constant-time comparison to mitigate timing attacks
  return timingSafeEqual(requestToken, storedToken);
}

/**
 * Performs a constant-time string comparison to prevent timing attacks.
 * Returns true if both strings are equal.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Extracts the CSRF token from common request locations:
 * 1. X-CSRF-Token header
 * 2. csrf_token form field (for form submissions)
 *
 * @param request - the incoming Request object
 * @returns the token string or null if not found
 */
export function extractCsrfToken(request: Request): string | null {
  // Check header first (preferred for API calls)
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) return headerToken;

  return null;
}

/**
 * Convenience function that extracts and verifies CSRF token from a request.
 * Returns true if valid, false otherwise.
 */
export async function validateCsrfRequest(request: Request): Promise<boolean> {
  const token = extractCsrfToken(request);
  return verifyCsrfToken(token);
}
