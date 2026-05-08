"use client";

// ── src/app/carrinho/page.tsx ─────────────────────────────────────────────────
// Cart page — /carrinho
// Protected: redirects to /login if not authenticated.
//
// Data flow:
//   1. GET /ordering/cart          → list of cart items (product_id, quantity, total_value)
//   2. GET /inventory/products/{id} → product details for each item (name, price, image)
//   3. PUT /ordering/cart/{id}     → update quantity
//   4. DELETE /ordering/cart/{id}  → remove item

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCart, getProduct, updateCartItem, removeFromCart, getProductImages } from "@/lib/api";
import type { CartItem, Product } from "@/types";

// ── Cart item enriched with product details ────────────────────────────────────
interface EnrichedCartItem extends CartItem {
  product: Product | null;
  image_url?: string;
}

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<EnrichedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // ── Fetch cart + product details ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    async function fetchCart() {
      setLoading(true);
      try {
        const cartItems = await getCart();

        // Fetch product details for each cart item in parallel
        const enriched = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const [product, images] = await Promise.all([
                getProduct(item.product_id),
                getProductImages(item.product_id),
              ]);
              return { ...item, product, image_url: images[0]?.image_url };
            } catch {
              return { ...item, product: null, image_url: undefined };
            }
          })
        );

        setItems(enriched);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [user]);

  // ── Update quantity ────────────────────────────────────────────────────────
  async function handleQuantityChange(
    cart_id: number,
    newQuantity: number,
    price: number
  ) {
    if (newQuantity < 1) return;
    setUpdatingId(cart_id);
    try {
      const updated = await updateCartItem(cart_id, {
        quantity: newQuantity,
        total_value: price * newQuantity,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.cart_id === cart_id
            ? { ...item, quantity: updated.quantity, total_value: updated.total_value }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating cart:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Remove item ────────────────────────────────────────────────────────────
  async function handleRemove(cart_id: number) {
    setUpdatingId(cart_id);
    try {
      await removeFromCart(cart_id);
      setItems((prev) => prev.filter((item) => item.cart_id !== cart_id));
    } catch (err) {
      console.error("Error removing from cart:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Calculate totals ───────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + Number(item.total_value), 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-semibold text-foreground mb-8">
          Seu Carrinho
        </h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 animate-pulse flex gap-4"
            >
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-semibold text-foreground">
          Seu carrinho está vazio
        </h2>
        <p className="text-muted-foreground text-sm text-center">
          Explore nossos produtos e adicione itens ao carrinho.
        </p>
        <Link
          href="/products"
          className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Seu Carrinho
        </h1>
        <span className="text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Items list ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => {
            const price = item.product?.price ?? 0;
            const isUpdating = updatingId === item.cart_id;

            return (
              <div
                key={item.cart_id}
                className={`bg-card border border-border rounded-xl p-4 flex gap-4 transition-opacity ${
                  isUpdating ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Product image */}
                <Link
                  href={`/products/${item.product_id}`}
                  className="flex-shrink-0"
                >
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product?.product_name ?? "Produto"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`}>
                    <h3 className="font-medium text-foreground text-sm hover:text-primary transition-colors line-clamp-2">
                      {item.product?.product_name ?? `Produto #${item.product_id}`}
                    </h3>
                  </Link>
                  <p className="text-primary font-semibold text-sm mt-1">
                    {formatPrice(price)} cada
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cart_id,
                            item.quantity - 1,
                            price
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1.5 hover:bg-accent transition-colors text-foreground disabled:opacity-40 text-sm"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-foreground border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cart_id,
                            item.quantity + 1,
                            price
                          )
                        }
                        className="px-2.5 py-1.5 hover:bg-accent transition-colors text-foreground text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground text-sm">
                        {formatPrice(item.total_value)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.cart_id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remover item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continue shopping */}
          <Link
            href="/products"
            className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
          >
            ← Continuar comprando
          </Link>
        </div>

        {/* ── Order summary ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold text-foreground mb-4">
              Resumo do pedido
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              {items.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                    {item.product?.product_name ?? `Produto #${item.product_id}`}
                    {item.quantity > 1 && (
                      <span className="text-xs"> ×{item.quantity}</span>
                    )}
                  </span>
                  <span className="text-foreground font-medium flex-shrink-0">
                    {formatPrice(item.total_value)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                + frete calculado no checkout
              </p>
            </div>

            <Link
              href="/checkout"
              className="block w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity text-center leading-[44px]"
            >
              Finalizar compra →
            </Link>

            <p className="text-xs text-muted-foreground text-center mt-3">
              🔒 Pagamento 100% seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}