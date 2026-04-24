"use client";

// ── src/app/checkout/page.tsx ─────────────────────────────────────────────────
// Checkout page — /checkout
// Protected: redirects to /login if not authenticated.
//
// Flow:
//   1. Load cart items + product details
//   2. User fills delivery address + payment method
//   3. On submit:
//      → POST /ordering/orders    → creates order
//      → POST /ordering/payments  → creates payment record
//      → POST /ordering/delivery  → creates delivery record
//      → Redirect to /success with order details

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getCart,
  getProduct,
  createOrder,
  createPayment,
} from "@/lib/api";
import type { CartItem, Product } from "@/types";

interface EnrichedCartItem extends CartItem {
  product: Product | null;
}

// ── Payment methods available ──────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "pix", label: "Pix", description: "Aprovação imediata", icon: "⚡" },
  { value: "credit_card", label: "Cartão de Crédito", description: "Até 12x sem juros", icon: "💳" },
  { value: "boleto", label: "Boleto Bancário", description: "Vence em 3 dias úteis", icon: "📄" },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Cart state ─────────────────────────────────────────────────────────────
  const [items, setItems] = useState<EnrichedCartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [address, setAddress] = useState({
    street: "",
    house_num: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  // ── Submit state ───────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  // ── Load cart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function fetchCart() {
      setLoadingCart(true);
      try {
        const cartItems = await getCart();
        const enriched = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const product = await getProduct(item.product_id);
              return { ...item, product };
            } catch {
              return { ...item, product: null };
            }
          })
        );
        setItems(enriched);
      } catch (err) {
        console.error("Error loading cart:", err);
      } finally {
        setLoadingCart(false);
      }
    }
    fetchCart();
  }, [user]);

  // ── Calculate total ────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + Number(item.total_value), 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  // ── Handle address field change ────────────────────────────────────────────
  function handleAddress(e: React.ChangeEvent<HTMLInputElement>) {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Submit order ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create order
      const order = await createOrder({
        order_total: Math.round(Number(subtotal)),
        status: false,  // false = pending
      });

      // 2. Create payment record
      await createPayment({
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        status: false,  // false = pending confirmation
        order_id: order.orders_id,
      });

      // 3. Redirect to success with order info
      router.push(
        `/success?order_id=${order.orders_id}&method=${paymentMethod}&total=${subtotal}`
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Erro ao finalizar pedido."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingCart) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-foreground font-medium">Seu carrinho está vazio.</p>
        <Link href="/products" className="text-primary hover:underline text-sm">
          ← Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Finalizar Pedido
        </h1>
        <p className="text-muted-foreground text-sm">
          🔒 Ambiente seguro — seus dados estão protegidos
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column — form ──────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* ── Delivery address ──────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
                Endereço de entrega
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Rua / Avenida
                  </label>
                  <input
                    name="street"
                    type="text"
                    value={address.street}
                    onChange={handleAddress}
                    placeholder="Rua das Flores"
                    required
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Número
                  </label>
                  <input
                    name="house_num"
                    type="text"
                    value={address.house_num}
                    onChange={handleAddress}
                    placeholder="123"
                    required
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Bairro
                  </label>
                  <input
                    name="neighborhood"
                    type="text"
                    value={address.neighborhood}
                    onChange={handleAddress}
                    placeholder="Centro"
                    required
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Cidade
                  </label>
                  <input
                    name="city"
                    type="text"
                    value={address.city}
                    onChange={handleAddress}
                    placeholder="Florianópolis"
                    required
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Estado
                  </label>
                  <input
                    name="state"
                    type="text"
                    value={address.state}
                    onChange={handleAddress}
                    placeholder="SC"
                    required
                    maxLength={2}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    CEP
                  </label>
                  <input
                    name="zip_code"
                    type="text"
                    value={address.zip_code}
                    onChange={handleAddress}
                    placeholder="88000-000"
                    required
                    maxLength={9}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* ── Payment method ────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                Forma de pagamento
              </h2>

              <div className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {method.label}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {method.description}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === method.value
                        ? "border-primary"
                        : "border-muted-foreground"
                    }`}>
                      {paymentMethod === method.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column — order summary ─────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold text-foreground mb-4">
                Resumo do pedido
              </h2>

              {/* Items */}
              <div className="flex flex-col gap-2 mb-4">
                {items.map((item) => (
                  <div key={item.cart_id} className="flex justify-between text-sm">
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
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Frete</span>
                  <span className="text-sm text-green-600 font-medium">
                    A calcular
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? "Processando..." : "Confirmar pedido →"}
              </button>

              <Link
                href="/carrinho"
                className="block text-center text-sm text-muted-foreground hover:text-foreground mt-3 transition-colors"
              >
                ← Voltar ao carrinho
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}