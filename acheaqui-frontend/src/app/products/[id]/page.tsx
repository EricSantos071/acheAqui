"use client";

// ── src/app/products/[id]/page.tsx ────────────────────────────────────────────
// Product detail page — /products/1, /products/2, etc.
//
// "use client" because:
//   - Add to cart interaction
//   - Review form submission
//   - Auth-aware UI (show/hide buttons based on login state)
//
// Data fetched:
//   - GET /inventory/products/{id}        → product info
//   - GET /inventory/product_images/{id}  → product images
//   - GET /analytics/reviews?product_id=  → reviews + avg rating
//   - GET /registers/entrepreneurs/{id}   → seller info

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getProduct,
  getProductImages,
  getReviews,
  getEntrepreneur,
  addToCart,
  createReview,
} from "@/lib/api";
import type { Product, ProductImage, Review } from "@/types";

// ── Star rating display ────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
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

// ── Interactive star picker for review form ────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={star <= (hovered || value) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={
              star <= (hovered || value)
                ? "text-primary"
                : "text-muted-foreground"
            }
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = Number(params.id);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [seller, setSeller] = useState<{ doc_cnpj: string; phone: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Cart state ─────────────────────────────────────────────────────────────
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // ── Review form state ──────────────────────────────────────────────────────
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // ── Fetch all data on mount ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Fetch product, images and reviews in parallel
        const [prod, imgs, revs] = await Promise.all([
          getProduct(productId),
          getProductImages(productId),
          getReviews({ product_id: productId }),
        ]);

        setProduct(prod);
        setImages(imgs);
        setReviews(revs.data);
        setAvgRating(revs.avg_rating ?? null);

        // Fetch seller info separately (needs entrepreneur_id from product)
        if (prod.entrepreneur_id) {
          try {
            const s = await getEntrepreneur(prod.entrepreneur_id);
            setSeller(s as { doc_cnpj: string; phone: string });
          } catch {
            // Seller info is nice to have, not critical
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [productId]);

  // ── Add to cart ────────────────────────────────────────────────────────────
  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!product) return;

    setCartLoading(true);
    setCartError(null);
    setCartSuccess(false);

    try {
      await addToCart({
        product_id: product.product_id,
        quantity,
        total_value: product.price * quantity,
      });
      setCartSuccess(true);
      const refreshed = await getProduct(productId);
      setProduct(refreshed);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setCartError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Erro ao adicionar ao carrinho."
      );
    } finally {
      setCartLoading(false);
    }
  }

  // ── Submit review ──────────────────────────────────────────────────────────
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      const newReview = await createReview({
        rating: reviewRating,
        comment: reviewComment,
        review_date: new Date().toISOString().split("T")[0],
        product_id: productId,
      });

      // Add new review to top of list
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Erro ao enviar avaliação."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  // ── Format price ───────────────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-foreground font-medium">
          Produto não encontrado
        </p>
        <Link href="/products" className="text-primary hover:underline text-sm">
          ← Voltar aos produtos
        </Link>
      </div>
    );
  }

  const isAvailable = product.status && product.in_stock > 0;
  const mainImage = images[selectedImage]?.image_url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/products" className="hover:text-foreground transition-colors">
          Produtos
        </Link>
        <span>›</span>
        <span className="text-foreground">{product.product_name}</span>
      </nav>

      {/* ── Main product section ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

        {/* ── Image gallery ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.product_name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.product_img_id}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedImage
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={`${product.product_name} ${idx + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Name + rating */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {product.product_name}
            </h1>
            {avgRating !== null && (
              <div className="flex items-center gap-2">
                <Stars rating={Math.round(avgRating)} />
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} ({reviews.length} avaliação
                  {reviews.length !== 1 ? "ões" : ""})
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>

          {/* Stock status */}
          <div>
            {isAvailable ? (
              <span className="text-sm text-green-600 font-medium">
                ✓ {product.in_stock} em estoque
              </span>
            ) : (
              <span className="text-sm text-destructive font-medium">
                ✗ Produto esgotado
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Quantity + Add to cart */}
          {isAvailable && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">
                  Quantidade:
                </label>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-accent transition-colors text-foreground"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-foreground border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.in_stock, q + 1))
                    }
                    className="px-3 py-2 hover:bg-accent transition-colors text-foreground"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cart feedback */}
              {cartSuccess && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Adicionado ao carrinho!
                </p>
              )}
              {cartError && (
                <p className="text-sm text-destructive">{cartError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cartLoading
                    ? "Adicionando..."
                    : user
                    ? "🛒 Adicionar ao carrinho"
                    : "Entrar para comprar"}
                </button>

                {user && (
                  <Link
                    href="/carrinho"
                    className="h-11 px-5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center"
                  >
                    Ver carrinho
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Seller info */}
          {seller && (
            <div className="bg-muted rounded-xl p-4 text-sm">
              <p className="font-medium text-foreground mb-1">
                Vendido por empreendedor local
              </p>
              <p className="text-muted-foreground">
                Contato: {seller.phone}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews section ───────────────────────────────────────────────── */}
      <div className="border-t border-border pt-10">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Avaliações ({reviews.length})
        </h2>

        {/* Review form — only for logged-in users */}
        {user ? (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h3 className="font-medium text-foreground mb-4">
              Deixe sua avaliação
            </h3>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">
                  Sua nota
                </label>
                <StarPicker
                  value={reviewRating}
                  onChange={setReviewRating}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="comment"
                  className="text-sm text-muted-foreground"
                >
                  Comentário
                </label>
                <textarea
                  id="comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Conte sua experiência com o produto..."
                  required
                  rows={3}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {reviewError && (
                <p className="text-destructive text-sm">{reviewError}</p>
              )}
              {reviewSuccess && (
                <p className="text-green-600 text-sm font-medium">
                  ✓ Avaliação enviada!
                </p>
              )}

              <button
                type="submit"
                disabled={reviewLoading}
                className="h-10 w-fit px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {reviewLoading ? "Enviando..." : "Enviar avaliação"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-muted rounded-xl p-6 mb-8 text-center">
            <p className="text-muted-foreground text-sm mb-3">
              Faça login para deixar uma avaliação
            </p>
            <Link
              href="/login"
              className="text-primary font-medium text-sm hover:underline"
            >
              Entrar →
            </Link>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Ainda não há avaliações. Seja o primeiro!
          </p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}