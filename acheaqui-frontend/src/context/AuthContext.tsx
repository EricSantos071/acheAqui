"use client";

// ── src/context/AuthContext.tsx ───────────────────────────────────────────────
// Global auth state — wraps the entire app.
//
// Why we need this:
//   The Navbar lives in layout.tsx and only mounts once.
//   When login/register succeeds and we navigate away, the Navbar
//   doesn't re-read localStorage automatically.
//   AuthContext solves this by giving all components a shared
//   user state that updates instantly when login/logout happens.
//
// How to use in any component:
//   const { user, setUser, logout } = useAuth();

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { CurrentUser } from "@/types";
import { getStoredUser, clearToken, setStoredUser, setToken, getToken } from "@/lib/auth";

// ── Context shape ──────────────────────────────────────────────────────────────
interface AuthContextType {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  logout: () => void;
  // Call this after login to update global state in one step
  loginSuccess: (token: string, user: CurrentUser) => void;
}

// ── Create context ─────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  loginSuccess: () => {},
});

// ── Provider component ─────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null);

  // Read stored user on app startup
  useEffect(() => {
    const stored = getStoredUser();
    const token = getToken();
    if (stored && token) {
      // Verify token is still valid by calling /me
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            setUserState(stored);
          } else {
            // Token expired — clear everything
            clearToken();
            setUserState(null);
          }
        })
        .catch(() => {
          // Network error — keep stored user, don't lock out
          setUserState(stored);
        });
    }
  }, []);

  // Update both context state and localStorage together
  const setUser = useCallback((u: CurrentUser | null) => {
    setUserState(u);
    if (u) {
      setStoredUser(u);
    }
  }, []);

  // Called after successful login — stores token + updates global state
  const loginSuccess = useCallback((token: string, u: CurrentUser) => {
    setToken(token);
    setStoredUser(u);
    setUserState(u);   // ← this triggers Navbar re-render immediately
  }, []);

  // Called on logout — clears everything
  const logout = useCallback(() => {
    clearToken();
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook for easy consumption ──────────────────────────────────────────────────
// Usage: const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}