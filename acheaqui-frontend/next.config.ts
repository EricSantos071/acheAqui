import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ── Image domains ──────────────────────────────────────────────────────────
  // Add Cloudinary so product images load correctly
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ← Cloudinary product images
      },
    ],
  },

  // ── Security headers ───────────────────────────────────────────────────────
  async headers() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // ── Content Security Policy ──────────────────────────────────
            // connect-src now includes your FastAPI API URL
            // In production replace 127.0.0.1:8000 with your real API domain
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data: blob:",
              "font-src 'self'",
              `connect-src 'self' ${apiUrl} http://localhost:8000 http://127.0.0.1:8000`,
              "frame-src 'self' https://www.youtube-nocookie.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;