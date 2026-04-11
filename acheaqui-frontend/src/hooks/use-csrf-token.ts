"use client";

import { useState, useEffect, useCallback } from "react";

interface CSRFTokenState {
  token: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  error: string | null;
}

interface UseCSRFTokenReturn extends CSRFTokenState {
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage CSRF token for form submissions
 *
 * Features:
 * - Automatic token refresh before expiry
 * - Error handling with retry
 * - Loading state management
 */
export function useCSRFToken(): UseCSRFTokenReturn {
  const [state, setState] = useState<CSRFTokenState>({
    token: null,
    expiresAt: null,
    isLoading: true,
    error: null,
  });

  const fetchToken = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/csrf", {
        method: "GET",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();

      setState({
        token: data.token,
        expiresAt: data.expiresAt,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch token",
      }));
    }
  }, []);

  // Fetch token on mount
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Auto-refresh token 5 minutes before expiry
  useEffect(() => {
    if (!state.expiresAt) return;

    const now = Date.now();
    const refreshTime = state.expiresAt - 5 * 60 * 1000; // 5 minutes before expiry
    const timeUntilRefresh = refreshTime - now;

    if (timeUntilRefresh <= 0) {
      // Token is about to expire or has expired, refresh now
      fetchToken();
      return;
    }

    const timer = setTimeout(() => {
      fetchToken();
    }, timeUntilRefresh);

    return () => clearTimeout(timer);
  }, [state.expiresAt, fetchToken]);

  return {
    ...state,
    refresh: fetchToken,
  };
}
