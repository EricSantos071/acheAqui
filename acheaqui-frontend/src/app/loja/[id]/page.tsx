"use client";

// ── src/app/loja/[id]/page.tsx ────────────────────────────────────────────────
// Store profile page — /loja/1, /loja/2, etc.
// Shows an entrepreneur's store with their products and reviews.
//
// Data fetched:
//   GET /registers/entrepreneurs/{id}          → entrepreneur info
//   GET /inventory/products?entrepreneur_id=   → their products
//   GET /analytics/reviews?                    → reviews on their products

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEntrepreneur, getProducts, getReviews } from "@/lib/api";
import ProductCard from "@/app/products/ProductCard";
import type { Product, Review } from "@/types";

// ── Star display ───────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={star <= rating ? "text-primary" : "text-muted-foreground"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function StoreProfilePage() {
  const params = useParams();
  const entrepreneurId = Number(params.id);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [entrepreneur, setEntrepreneur] = useState<{
    entrepreneurs_id: number;
    doc_cnpj: string;
    phone: string;
    status: boolean;
    created_at: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"products" | "reviews">("products");

  // ── Fetch all store data ───────────────────────────────────────────────────
  useEffect(() => {
    async function fetchStore() {
      setLoading(true);
      try {
        // Fetch entrepreneur info and their products in parallel
        const [ent, prods] = await Promise.all([
          getEntrepreneur(entrepreneurId),
          getProducts({
            entrepreneur_id: entrepreneurId,
            status: true,
            limit: 100,
          }),
        ]);

        setEntrepreneur(ent as typeof entrepreneur);
        setProducts(prods.data);

        // Fetch reviews for all their products
        // We get all reviews and the avg_rating from the endpoint
        if (prods.data.length > 0) {
          try {
            // Fetch reviews for each product and combine
            const reviewPromises = prods.data
              .slice(0, 5) // limit to first 5 products to avoid too many requests
              .map((p) => getReviews({ product_id: p.product_id, page: 1 }));
            const reviewResults = await Promise.all(reviewPromises);

            const allReviews = reviewResults.flatMap((r) => r.data);
            const allRatings = allReviews.map((r) => r.rating);
            const avg =
              allRatings.length > 0
                ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
                : null;

            setReviews(allReviews.slice(0, 10)); // show max 10 reviews
            setAvgRating(avg ? Math.round(avg * 10) / 10 : null);
          } catch {
            // Reviews are nice to have — don't block store display
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [entrepreneurId]);

  // ── Format helpers ─────────────────────────────────────────────────────────
  const memberSince = entrepreneur?.created_at
    ? new Date(entrepreneur.created_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-muted rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !entrepreneur) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-foreground font-medium">
          Loja não encontrada
        </p>
        <Link href="/products" className="text-primary hover:underline text-sm">
          ← Voltar aos produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Store header ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">

        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-accent via-secondary to-primary/20" />

        {/* Store info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-4 border-card shadow-sm">
              🏪
            </div>

            {/* Verified badge */}
            {entrepreneur.status && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Loja verificada
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground mb-1">
                {(entrepreneur as any).store_name ?? `Loja #${entrepreneur.entrepreneurs_id}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                📞 {entrepreneur.phone}
              </p>
              {memberSince && (
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde {memberSince}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {products.length}
                </p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
              {avgRating !== null && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {reviews.length}
                </p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </div>

          {/* Average stars */}
          {avgRating !== null && (
            <div className="flex items-center gap-2 mt-3">
              <Stars rating={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} de 5 — baseado em {reviews.length} avaliação
                {reviews.length !== 1 ? "ões" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-8 w-fit">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "products"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Produtos ({products.length})
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "reviews"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Avaliações ({reviews.length})
        </button>
      </div>

      {/* ── Products tab ──────────────────────────────────────────────────── */}
      {tab === "products" && (
        <>
          {products.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <p className="text-muted-foreground mb-2">
                Esta loja ainda não tem produtos disponíveis.
              </p>
              <Link
                href="/products"
                className="text-primary hover:underline text-sm"
              >
                ← Ver outros produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Reviews tab ───────────────────────────────────────────────────── */}
      {tab === "reviews" && (
        <>
          {reviews.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <p className="text-muted-foreground">
                Esta loja ainda não tem avaliações.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review.reviews_id}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.review_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {review.comment}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Produto #{review.product_id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}