"use client";

// ── src/app/login/page.tsx ────────────────────────────────────────────────────
// Login page — /login
//
// "use client" because this page:
//   - Has a form with controlled inputs (useState)
//   - Calls the API on submit
//   - Writes to localStorage after success
//   - Redirects programmatically
//
// No server-side fetch needed here — login is always interactive.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setToken, setStoredUser, isLoggedIn } from "@/lib/auth";
import { getMe } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Redirect if already logged in ──────────────────────────────────────────
  // No point showing login to someone already authenticated
  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/products");
    }
  }, [router]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();         // prevent browser default form submission
    setError(null);             // clear any previous error
    setLoading(true);

    try {
      // 1. Call POST /auth/login
      const data = await login(email, password);

      // 2. Store the token
      setToken(data.access_token);

      // 3. Fetch full user profile and store it
      //    (login response has basic info, /me has everything)
      const me = await getMe();
      setStoredUser({
        clients_id: me.clients_id,
        first_name: me.first_name,
        last_name: me.last_name,
        email: me.email,
        is_entrepreneur: data.is_entrepreneur,
        entrepreneur_id: me.entrepreneur_id,
      });

      // 4. Redirect — entrepreneurs go to dashboard, buyers go to products
      if (data.is_entrepreneur) {
        router.push("/dashboard");
      } else {
        router.push("/products");
      }

    } catch (err) {
      // The error message comes from FastAPI's detail field
      // api.ts extracts it for us automatically
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* ── Card ──────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground text-sm">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                autoComplete="email"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Senha
                </label>
                {/* Forgot password — placeholder for later */}
                <span className="text-xs text-muted-foreground cursor-not-allowed">
                  Esqueceu a senha?
                </span>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            {/* ── Error message ────────────────────────────────────────────── */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* ── Submit button ─────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* ── Divider ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Register link ─────────────────────────────────────────────── */}
          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>

        {/* ── Back to products ──────────────────────────────────────────────── */}
        <p className="text-center mt-4">
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Continuar comprando sem conta
          </Link>
        </p>
      </div>
    </div>
  );
}