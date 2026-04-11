import { NextRequest, NextResponse } from "next/server";
import { isValidOrigin } from "@/lib/origin-validation";

// In-memory rate limit store (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP
const FORM_RATE_LIMIT_MAX = 5; // 5 form submissions per minute per IP

/**
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  // Prioritize headers in order of trustworthiness
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  const vercelIP = request.headers.get("x-vercel-forwarded-for");

  if (vercelIP) {
    return vercelIP.split(",")[0].trim();
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Check if request is rate limited
 */
function isRateLimited(ip: string, isFormSubmission: boolean): boolean {
  const now = Date.now();
  const key = isFormSubmission ? `form:${ip}` : `api:${ip}`;
  const maxRequests = isFormSubmission
    ? FORM_RATE_LIMIT_MAX
    : RATE_LIMIT_MAX_REQUESTS;

  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

/**
 * Clean up expired rate limit entries periodically
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  const isFormRoute = pathname === "/api/form";

  // Rate limiting
  if (isRateLimited(clientIP, isFormRoute)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": isFormRoute
            ? FORM_RATE_LIMIT_MAX.toString()
            : RATE_LIMIT_MAX_REQUESTS.toString(),
        },
      }
    );
  }

  // Origin validation for form submissions (POST requests)
  if (isFormRoute && request.method === "POST") {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    if (!isValidOrigin(origin, referer)) {
      return NextResponse.json(
        { error: "Invalid origin" },
        { status: 403 }
      );
    }
  }

  // Continue with the request and add security headers
  const response = NextResponse.next();

  // Security headers (supplement next.config.ts headers)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // CORS headers for API routes
  const origin = request.headers.get("origin");
  if (origin && isValidOrigin(origin, null)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, X-CSRF-Token"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
