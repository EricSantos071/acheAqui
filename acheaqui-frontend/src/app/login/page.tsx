"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, getMe } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Login → get token
      const data = await login(email, password);

      // 2. Fetch full profile - Debug consoles added
      console.log("LOGIN DATA:", data);

      const me = await getMe(data.access_token);

      console.log("ME DATA:", me);

      // 3. loginSuccess updates BOTH localStorage AND global context state
      //    This triggers Navbar to re-render with the greeting immediately
      loginSuccess(data.access_token, {
        clients_id: me.clients_id,
        first_name: me.first_name,
        last_name: me.last_name,
        email: me.email,
        is_entrepreneur: data.is_entrepreneur,
        entrepreneur_id: me.entrepreneur_id,
      });

      // 4. Redirect
      if (data.is_entrepreneur) {
        router.push("/dashboard");
      } else {
        router.push("/products");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground text-sm">
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
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
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <Link
              href="/esqueci-senha"
              className="text-xs text-primary hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Continuar comprando sem conta
          </Link>
        </p>
      </div>
    </div>
  );
}