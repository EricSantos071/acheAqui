"use client";

// ── ProductsClient.tsx ────────────────────────────────────────────────────────
// Client component — handles all interactivity:
//   - Search input
//   - Category filter
//   - Price range filter
//   - Pagination
//   - Re-fetches from API when filters change
//
// Receives initialData from the server component (page.tsx)
// so the first render is instant — no loading spinner on page load.

import { useState, useEffect, useCallback } from "react";
import ProductCard, { Product } from "./ProductCard";

interface Category {
  category_id: number;
  category_name: string;
}

interface ApiResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductsClientProps {
  initialData: ApiResponse;
  categories: Category[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const LIMIT = 12; // products per page

export default function ProductsClient({
  initialData,
  categories,
}: ProductsClientProps) {
  // ── Filter state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [data, setData] = useState<ApiResponse>(initialData);
  const [loading, setLoading] = useState(false);

  // ── Fetch products when filters change ────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", LIMIT.toString());
      params.set("status", "true"); // only show available products

      if (search.trim()) params.set("search", search.trim());
      if (categoryId) params.set("category_id", categoryId.toString());
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);

      const res = await fetch(
        `${API_URL}/inventory/products?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, minPrice, maxPrice, page]);

  // Re-fetch whenever filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => setPage(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-1">
          Produtos
        </h1>
        <p className="text-muted-foreground">
          {data.total} produto{data.total !== 1 ? "s" : ""} encontrado
          {data.total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Filters bar ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8 flex flex-wrap gap-3 items-end">

        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Buscar produto
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            placeholder="Ex: artesanato, doces..."
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Category */}
        <div className="min-w-[160px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Categoria
          </label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : null);
              handleFilterChange();
            }}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Min price */}
        <div className="w-28">
          <label className="text-xs text-muted-foreground mb-1 block">
            Preço mín.
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              handleFilterChange();
            }}
            placeholder="R$ 0"
            min="0"
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Max price */}
        <div className="w-28">
          <label className="text-xs text-muted-foreground mb-1 block">
            Preço máx.
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              handleFilterChange();
            }}
            placeholder="R$ 999"
            min="0"
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Clear filters */}
        {(search || categoryId || minPrice || maxPrice) && (
          <button
            onClick={() => {
              setSearch("");
              setCategoryId(null);
              setMinPrice("");
              setMaxPrice("");
              setPage(1);
            }}
            className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Product grid ─────────────────────────────────────────────────── */}
      {loading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-5 bg-muted rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : data.data.length === 0 ? (
        // Empty state
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-2">
            Nenhum produto encontrado
          </p>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou buscar por outro termo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.data.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">

          {/* Previous */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 px-4 text-sm border border-border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
          >
            ← Anterior
          </button>

          {/* Page numbers */}
          {Array.from({ length: data.pages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === data.pages || Math.abs(p - page) <= 1
            )
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-2">
                {/* Ellipsis gap */}
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-muted-foreground text-sm">…</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`h-9 w-9 text-sm rounded-lg border transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="h-9 px-4 text-sm border border-border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}