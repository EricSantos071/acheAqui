// ── src/app/products/page.tsx ─────────────────────────────────────────────────
// Products page — fully client-side rendering.
// We skip server-side fetch entirely during development because Next.js
// server context can't reliably reach localhost:8000.
// ProductsClient handles all fetching directly from the browser.

import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "Produtos | AcheAqui",
  description: "Explore produtos locais de empreendedores da sua região.",
};

// Empty initial data — ProductsClient fetches everything on mount
const EMPTY = { data: [], page: 1, limit: 12, total: 0, pages: 0 };

export default function ProductsPage() {
  return <ProductsClient initialData={EMPTY} categories={[]} />;
}