import { randomBytes, createHmac, timingSafeEqual } from "crypto";

const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Get the CSRF secret, with appropriate fallbacks for different environments
 * In production, the environment variable is required
 * In development/test, a fallback is used
 */
function getSecret(): string {
  const secret = process.env.CSRF_SECRET;

  if (secret) {
    return secret;
  }

  // Allow builds without the secret (Vercel will inject at runtime)
  if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    // During build time, use a placeholder
    // At runtime, the actual secret will be available
    if (process.env.VERCEL || process.env.NEXT_PHASE === "phase-production-build") {
      return "build-time-placeholder-not-used-at-runtime";
    }
    throw new Error("CSRF_SECRET environment variable is required in production");
  }

  // Development/test fallback
  return "development-csrf-secret-do-not-use-in-production";
}

export interface CSRFToken {
  token: string;
  expiresAt: number;
}

/**
 * Generate a cryptographically secure CSRF token with HMAC signature
 */
export function generateCSRFToken(): CSRFToken {
  const randomToken = randomBytes(32).toString("hex");
  const timestamp = Date.now();
  const expiresAt = timestamp + CSRF_TOKEN_EXPIRY;

  // Create HMAC signature to prevent tampering
  const signature = createHmac("sha256", getSecret())
    .update(`${randomToken}:${timestamp}`)
    .digest("hex");

  const token = `${randomToken}.${timestamp}.${signature}`;

  return {
    token,
    expiresAt,
  };
}

/**
 * Validate CSRF token with timing-safe comparison
 */
export function validateCSRFToken(token: string): boolean {
  try {
    if (!token || typeof token !== "string") {
      return false;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    const [randomToken, timestamp, signature] = parts;

    if (!randomToken || !timestamp || !signature) {
      return false;
    }

    // Validate token format
    if (!/^[a-f0-9]{64}$/.test(randomToken)) {
      return false;
    }

    if (!/^[a-f0-9]{64}$/.test(signature)) {
      return false;
    }

    const tokenTimestamp = parseInt(timestamp, 10);
    if (isNaN(tokenTimestamp)) {
      return false;
    }

    const now = Date.now();

    // Check if token has expired
    if (now > tokenTimestamp + CSRF_TOKEN_EXPIRY) {
      return false;
    }

    // Prevent tokens from the future (clock skew tolerance: 5 minutes)
    if (tokenTimestamp > now + 5 * 60 * 1000) {
      return false;
    }

    // Verify signature using timing-safe comparison
    const expectedSignature = createHmac("sha256", getSecret())
      .update(`${randomToken}:${timestamp}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request headers
 */
export function extractCSRFTokenFromHeader(request: Request): string | null {
  return (
    request.headers.get("x-csrf-token") ||
    request.headers.get("X-CSRF-Token") ||
    null
  );
}
