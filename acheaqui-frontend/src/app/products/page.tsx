// ── src/app/products/page.tsx ─────────────────────────────────────────────────
// Server component — runs on the server at request time.
//
// Responsibilities:
//   1. Fetch initial products from your FastAPI backend
//   2. Fetch categories for the filter dropdown
//   3. Pass both to ProductsClient (which handles interactivity)
//
// Why server component for initial fetch?
//   - Page loads with real content immediately (no loading spinner on first visit)
//   - Google can crawl and index all products (SEO)
//   - After load, ProductsClient takes over for filter interactions

import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Fetch initial products (server-side) ──────────────────────────────────────
async function getInitialProducts() {
  try {
    const res = await fetch(
      `${API_URL}/inventory/products?page=1&limit=12&status=true`,
      {
        // next.js cache: revalidate every 60 seconds
        // products change occasionally so we don't want stale data forever
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error("Server fetch error:", err);
    // Return empty state — client will retry on mount
    return { data: [], page: 1, limit: 12, total: 0, pages: 0 };
  }
}

// ── Fetch categories for filter dropdown (server-side) ────────────────────────
async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/inventory/category?limit=100`, {
      next: { revalidate: 300 }, // categories change rarely — cache 5 minutes
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    // category endpoint returns { data: [...] }
    return json.data ?? [];
  } catch (err) {
    console.error("Server fetch categories error:", err);
    return [];
  }
}

// ── Page metadata (SEO) ───────────────────────────────────────────────────────
export const metadata = {
  title: "Produtos | AcheAqui",
  description:
    "Explore produtos locais de empreendedores da sua região. Artesanato, gastronomia, moda e muito mais.",
};

// ── Page component ────────────────────────────────────────────────────────────
export default async function ProductsPage() {
  // Both fetches run in parallel — faster than sequential
  const [initialData, categories] = await Promise.all([
    getInitialProducts(),
    getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground text-sm animate-pulse">
            Carregando produtos...
          </div>
        </div>
      }
    >
      <ProductsClient
        initialData={initialData}
        categories={categories}
      />
    </Suspense>
  );
}