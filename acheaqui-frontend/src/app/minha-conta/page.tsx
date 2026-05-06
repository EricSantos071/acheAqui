"use client";

// ── src/app/minha-conta/page.tsx ──────────────────────────────────────────────
// Client profile page — /minha-conta
// Protected: redirects to /login if not authenticated.
//
// Sections:
//   1. Profile card — name, email, phone, CPF
//   2. Edit profile form
//   3. Order history
//   4. Entrepreneur shortcut (if applicable)

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/api";
import type { Order } from "@/types";

type Tab = "profile" | "orders";

export default function MinhaContaPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ── Edit form state ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Redirect if not logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  // ── Fetch orders when tab switches ────────────────────────────────────────
  useEffect(() => {
    if (tab !== "orders" || !user) return;
    setOrdersLoading(true);
    getOrders({ page: 1 })
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [tab, user]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Minha Conta
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seu perfil e pedidos
          </p>
        </div>

        {/* Entrepreneur shortcut */}
        {user.is_entrepreneur && (
          <Link
            href="/dashboard"
            className="h-9 px-4 rounded-xl border border-border text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
          >
            🏪 Meu painel
          </Link>
        )}
      </div>

      {/* ── Profile card ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5">

        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
          {user.first_name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground text-lg">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            {user.is_entrepreneur ? (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                🏪 Empreendedor
              </span>
            ) : (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                👤 Cliente
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => { logout(); router.push("/"); }}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
        >
          Sair
        </button>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6 w-fit">
        {(["profile", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "profile" ? "Perfil" : "Meus Pedidos"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1 — PROFILE
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "profile" && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">
              Informações pessoais
            </h3>
            <button
              onClick={() => { setEditing(!editing); setEditError(null); setEditSuccess(false); }}
              className="text-sm text-primary hover:underline"
            >
              {editing ? "Cancelar" : "Editar"}
            </button>
          </div>

          {!editing ? (
            // ── Read-only view ───────────────────────────────────────────
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nome", value: `${user.first_name} ${user.last_name}` },
                { label: "E-mail", value: user.email },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                  <p className="text-sm font-medium text-foreground">{field.value}</p>
                </div>
              ))}

              {!user.is_entrepreneur && (
                <div className="sm:col-span-2 mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Quer começar a vender no AcheAqui?
                  </p>
                  <Link
                    href="/register"
                    className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                  >
                    🏪 Registrar meu negócio
                  </Link>
                </div>
              )}
            </div>
          ) : (
            // ── Edit form ────────────────────────────────────────────────
            // For now shows a coming soon message
            // Full edit needs GET /registers/clients/me to prefill fields
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-2">
                Edição de perfil completa em breve.
              </p>
              <p className="text-xs text-muted-foreground">
                Para alterar seus dados entre em contato com o suporte.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2 — ORDERS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "orders" && (
        <div className="flex flex-col gap-4">

          {ordersLoading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhum pedido.
              </p>
              <Link
                href="/products"
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center"
              >
                Explorar produtos →
              </Link>
            </div>
          )}

          {!ordersLoading && orders.map((order) => (
            <div
              key={order.orders_id}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground text-sm">
                    Pedido #{order.orders_id}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {order.status ? "✓ Concluído" : "⏳ Pendente"}
                  </span>
                </div>
                <span className="font-bold text-primary text-sm">
                  {formatPrice(Number(order.order_total))}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {order.status
                    ? "Seu pedido foi entregue com sucesso."
                    : "Aguardando confirmação do pagamento."}
                </p>
                <Link
                  href={`/success?order_id=${order.orders_id}&method=pix&total=${order.order_total}`}
                  className="text-xs text-primary hover:underline flex-shrink-0 ml-3"
                >
                  Ver detalhes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}