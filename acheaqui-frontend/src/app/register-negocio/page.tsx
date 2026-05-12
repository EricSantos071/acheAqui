"use client";

// ── src/app/registrar-negocio/page.tsx ───────────────────────────────────────
// Standalone entrepreneur registration for existing logged-in clients.
// Skips step 1 (already have an account) and goes straight to business info.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { registerEntrepreneur, getMe } from "@/lib/api";

export default function RegistrarNegocioPage() {
  const { user, loginSuccess } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    store_name: "",
    doc_cnpj: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Guards ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.is_entrepreneur) { router.replace("/dashboard"); }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerEntrepreneur({
        doc_cnpj: form.doc_cnpj,
        phone: form.phone,
        store_name: form.store_name || undefined,
      });

      const me = await getMe();
      loginSuccess("", {
        clients_id: me.clients_id,
        first_name: me.first_name,
        last_name: me.last_name,
        email: me.email,
        is_entrepreneur: true,
        entrepreneur_id: me.entrepreneur_id,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar negócio.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">

          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏪</div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Registrar meu negócio
            </h1>
            <p className="text-muted-foreground text-sm">
              Olá {user.first_name}! Preencha os dados do seu negócio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Nome da loja
                <span className="text-muted-foreground font-normal ml-1">(aparece publicamente)</span>
              </label>
              <input
                type="text"
                value={form.store_name}
                onChange={(e) => setForm(p => ({ ...p, store_name: e.target.value }))}
                placeholder="Ex: Doces da Mari"
                maxLength={100}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">CNPJ *</label>
              <input
                type="text"
                value={form.doc_cnpj}
                onChange={(e) => {
                  const masked = e.target.value
                    .replace(/\D/g, "").slice(0, 14)
                    .replace(/(\d{2})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1/$2")
                    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
                  setForm(p => ({ ...p, doc_cnpj: masked }));
                }}
                placeholder="00.000.000/0001-00"
                required
                maxLength={18}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Telefone do negócio *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  const masked = e.target.value
                    .replace(/\D/g, "").slice(0, 11)
                    .replace(/(\d{2})(\d)/, "($1) $2")
                    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
                  setForm(p => ({ ...p, phone: masked }));
                }}
                placeholder="(48) 99999-9999"
                required
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
              {loading ? "Cadastrando..." : "Cadastrar meu negócio →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}