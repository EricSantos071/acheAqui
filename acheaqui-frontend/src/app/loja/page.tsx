"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEntrepreneurs, getProducts } from "@/lib/api";
import type { Entrepreneur } from "@/types";

interface EnrichedStore extends Entrepreneur {
  product_count: number;
}

export default function LojasPage() {
  const [stores, setStores] = useState<EnrichedStore[]>([]);
  const [filtered, setFiltered] = useState<EnrichedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      try {
        const entrepreneurs = await getEntrepreneurs({ limit: 100 });
        const enriched = await Promise.all(
          entrepreneurs.map(async (ent: Entrepreneur) => {
            try {
              const prods = await getProducts({
                entrepreneur_id: ent.entrepreneurs_id,
                status: true,
                limit: 1,
              });
              return { ...ent, product_count: prods.total };
            } catch {
              return { ...ent, product_count: 0 };
            }
          })
        );
        const active = enriched.filter((s) => s.status);
        setStores(active);
        setFiltered(active);
      } catch (err) {
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(stores); return; }
    const lower = search.toLowerCase();
    setFiltered(
      stores.filter((s) =>
        (s.store_name ?? "").toLowerCase().includes(lower) ||
        s.phone.toLowerCase().includes(lower)
      )
    );
  }, [search, stores]);

  function memberSince(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      month: "short", year: "numeric",
    });
  }

  // ── Display name helper ────────────────────────────────────────────────────
  function displayName(store: EnrichedStore) {
    return store.store_name ?? `Loja #${store.entrepreneurs_id}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Lojas locais</h1>
        <p className="text-muted-foreground">
          {stores.length} empreendedor{stores.length !== 1 ? "es" : ""} cadastrado{stores.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar loja por nome ou telefone..."
          className="w-full max-w-md h-10 rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="h-24 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          {search ? (
            <>
              <p className="text-muted-foreground mb-2">Nenhuma loja encontrada para "{search}"</p>
              <button onClick={() => setSearch("")} className="text-primary hover:underline text-sm">Limpar busca</button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">Nenhuma loja cadastrada ainda.</p>
              <Link href="/register" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center">
                Seja o primeiro empreendedor →
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((store) => (
            <Link key={store.entrepreneurs_id} href={`/loja/${store.entrepreneurs_id}`} className="group block">
              <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full">
                <div className="h-24 bg-gradient-to-br from-accent via-secondary to-primary/20 relative">
                  <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold border-4 border-card shadow-sm">
                    🏪
                  </div>
                  {store.status && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded-full">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Verificada
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-8 px-5 pb-5">
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {displayName(store)}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">📞 {store.phone}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                    <span>📦 {store.product_count} produto{store.product_count !== 1 ? "s" : ""}</span>
                    <span>📅 Desde {memberSince(store.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && stores.length > 0 && (
        <div className="mt-12 bg-accent border border-border rounded-2xl p-8 text-center">
          <h3 className="font-semibold text-foreground mb-2">Quer ter sua loja aqui?</h3>
          <p className="text-muted-foreground text-sm mb-4">Cadastre-se gratuitamente e comece a vender hoje.</p>
          <Link href="/register" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center">
            Criar minha loja →
          </Link>
        </div>
      )}
    </div>
  );
}