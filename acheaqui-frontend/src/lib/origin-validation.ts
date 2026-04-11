/**
 * Allowed origins for form submissions.
 * Update ALLOWED_ORIGINS with your production domains.
 */
const ALLOWED_ORIGINS: string[] = [
  // Add your production origins here, e.g.:
  // "https://yourdomain.com",
  // "https://www.yourdomain.com",
];

// Development origins (only allowed in non-production)
const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

/**
 * Check if the given origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Parse and normalize the origin
  let normalizedOrigin: string;
  try {
    const url = new URL(origin);
    normalizedOrigin = `${url.protocol}//${url.host}`;
  } catch {
    return false;
  }

  // Check configured production origins
  if (ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(normalizedOrigin)) {
    return true;
  }

  // Check NEXT_PUBLIC_SITE_URL as an allowed origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const siteOrigin = new URL(siteUrl);
      if (normalizedOrigin === `${siteOrigin.protocol}//${siteOrigin.host}`) {
        return true;
      }
    } catch {
      // ignore invalid SITE_URL
    }
  }

  // Check development origins only in non-production
  if (process.env.NODE_ENV !== "production") {
    if (DEV_ORIGINS.includes(normalizedOrigin)) {
      return true;
    }
  }

  // Check Vercel preview deployments using the project-specific VERCEL_URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && normalizedOrigin === `https://${vercelUrl}`) {
    return true;
  }

  return false;
}

/**
 * Validate request origin and referer for form submissions
 */
export function isValidOrigin(
  origin: string | null,
  referer: string | null
): boolean {
  // In production, origin header is required
  if (process.env.NODE_ENV === "production" && !origin) {
    return false;
  }

  // Validate origin if present
  if (origin && !isAllowedOrigin(origin)) {
    return false;
  }

  // If no origin, validate referer as fallback
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      return isAllowedOrigin(refererOrigin);
    } catch {
      return false;
    }
  }

  // Allow in development if no headers (direct API testing)
  if (process.env.NODE_ENV !== "production" && !origin && !referer) {
    return true;
  }

  return origin !== null;
}
