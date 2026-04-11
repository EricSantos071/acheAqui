import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";

/**
 * GET /api/csrf - Generate a new CSRF token
 *
 * Security measures:
 * - Rate limited via proxy
 * - Returns token in response body (not cookie) for SPA usage
 * - Token includes HMAC signature and expiry
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { token, expiresAt } = generateCSRFToken();

    return NextResponse.json(
      {
        token,
        expiresAt,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
