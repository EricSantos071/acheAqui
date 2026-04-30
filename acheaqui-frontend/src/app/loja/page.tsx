"use client";

// ── src/app/lojas/page.tsx ────────────────────────────────────────────────────
// Store listing page — /lojas
// Shows all registered entrepreneurs as store cards.
// Public — no auth required.
//
// Data fetched:
//   GET /registers/entrepreneurs → list of all active stores
//   GET /inventory/products?entrepreneur_id= → product count per store
//   GET /analytics/reviews? → avg rating per store

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEntrepreneurs, getProducts } from "@/lib/api";
import type { Entrepreneur } from "@/types";

// ── Store card enriched with extra data ────────────────────────────────────────
interface EnrichedStore extends Entrepreneur {
  product_count: number;
}

export default function LojasPage() {
  const [stores, setStores] = useState<EnrichedStore[]>([]);
  const [filtered, setFiltered] = useState<EnrichedStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Fetch all stores + their product counts ────────────────────────────────
  useEffect(() => {
    async function fetchStores() {
      setLoading(true);
      try {
        const entrepreneurs = await getEntrepreneurs({ limit: 100 });

        // Fetch product count for each store in parallel
        const enriched = await Promise.all(
          entrepreneurs.map(async (ent: Entrepreneur) => {
            try {
              const prods = await getProducts({
                entrepreneur_id: ent.entrepreneurs_id,
                status: true,
                limit: 1, // we only need the total count
              });
              return {
                ...ent,
                product_count: prods.total,
              };
            } catch {
              return { ...ent, product_count: 0 };
            }
          })
        );

        // Only show active stores
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

  // ── Filter by search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(stores);
      return;
    }
    const lower = search.toLowerCase();
    setFiltered(
      stores.filter(
        (s) =>
          s.phone.toLowerCase().includes(lower) ||
          s.doc_cnpj.includes(lower) ||
          s.entrepreneurs_id.toString().includes(lower)
      )
    );
  }, [search, stores]);

  // ── Member since helper ────────────────────────────────────────────────────
  function memberSince(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Lojas locais
        </h1>
        <p className="text-muted-foreground">
          {stores.length} empreendedor{stores.length !== 1 ? "es" : ""} cadastrado
          {stores.length !== 1 ? "s" : ""} na plataforma
        </p>
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar loja por telefone ou CNPJ..."
          className="w-full max-w-md h-10 rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-24 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          {search ? (
            <>
              <p className="text-muted-foreground mb-2">
                Nenhuma loja encontrada para "{search}"
              </p>
              <button
                onClick={() => setSearch("")}
                className="text-primary hover:underline text-sm"
              >
                Limpar busca
              </button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                Nenhuma loja cadastrada ainda.
              </p>
              <Link
                href="/register"
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center"
              >
                Seja o primeiro empreendedor →
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── Store grid ────────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((store) => (
            <Link
              key={store.entrepreneurs_id}
              href={`/loja/${store.entrepreneurs_id}`}
              className="group block"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full">

                {/* Store banner */}
                <div className="h-24 bg-gradient-to-br from-accent via-secondary to-primary/20 relative">
                  {/* Store avatar */}
                  <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold border-4 border-card shadow-sm">
                    🏪
                  </div>

                  {/* Verified badge */}
                  {store.status && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-white/90 dark:bg-card/90 px-2 py-0.5 rounded-full">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verificada
                      </span>
                    </div>
                  )}
                </div>

                {/* Store info */}
                <div className="pt-8 px-5 pb-5">
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    Loja #{store.entrepreneurs_id}
                  </h2>

                  <p className="text-sm text-muted-foreground mb-3">
                    📞 {store.phone}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                      {store.product_count} produto{store.product_count !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Desde {memberSince(store.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── CTA for new entrepreneurs ──────────────────────────────────────── */}
      {!loading && stores.length > 0 && (
        <div className="mt-12 bg-accent border border-border rounded-2xl p-8 text-center">
          <h3 className="font-semibold text-foreground mb-2">
            Quer ter sua loja aqui?
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Cadastre-se gratuitamente e comece a vender hoje.
          </p>
          <Link
            href="/register"
            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center"
          >
            Criar minha loja →
          </Link>
        </div>
      )}
    </div>
  );
}