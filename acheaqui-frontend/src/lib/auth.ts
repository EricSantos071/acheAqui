// ── src/lib/auth.ts ───────────────────────────────────────────────────────────
// JWT token helpers — store, read and clear the auth token.
// We use localStorage for simplicity during development.
// All functions check for window to avoid SSR errors (Next.js runs on server too).

import type { CurrentUser } from "@/types";

const TOKEN_KEY = "acheaqui_token";
const USER_KEY = "acheaqui_user";

// ── Token ──────────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

// ── User ───────────────────────────────────────────────────────────────────────

export function getStoredUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: CurrentUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Auth header ────────────────────────────────────────────────────────────────
// Pass this to any fetch call that needs authentication
// Usage: fetch(url, { headers: authHeader() })

export function authHeader(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}