"use client";

// ── src/app/dashboard/page.tsx ────────────────────────────────────────────────
// Entrepreneur dashboard — /dashboard
// Protected: redirects to /login if not authenticated.
// Redirects to /products if logged in but not an entrepreneur.
//
// Data fetched:
//   GET /inventory/products?entrepreneur_id=  → my products
//   GET /ordering/orders                      → recent orders
//   GET /analytics/reviews?                   → reviews on my products
//   GET /inventory/category                   → for product creation form

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authHeader } from "@/lib/auth";
import { BANNER_PRESETS } from "@/lib/presets";
import {
  getProducts,
  getOrders,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadEntrepreneurProfile,
  uploadEntrepreneurBanner,
  updateEntrepreneur
} from "@/lib/api";
import type { Product, Order, Category } from "@/types";

// ── Tab type ───────────────────────────────────────────────────────────────────
type Tab = "overview" | "products" | "orders";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [presetSaved, setPresetSaved] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [storePhone, setStorePhone] = useState("");

  // ── Data state ─────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ── New product form state ─────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    barcode: "",
    description: "",
    price: "",
    in_stock: "",
    category_id: "",
    status: true,
  });

  // ── Redirect guards ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.is_entrepreneur) {
      router.replace("/products");
    }
  }, [user, router]);

  // ── Fetch dashboard data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.is_entrepreneur || !user.entrepreneur_id) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [prods, ords, cats] = await Promise.all([
          getProducts({ entrepreneur_id: user!.entrepreneur_id!, limit: 100 }),
          getOrders({ page: 1 }),
          getCategories(),
        ]);
        setProducts(prods.data);
        setOrders(ords.data);
        setCategories(cats.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [user]);

  // ── KPI calculations ───────────────────────────────────────────────────────
  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.order_total),
    0
  );
  const completedOrders = orders.filter((o) => o.status).length;
  const activeProducts = products.filter((p) => p.status).length;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);

  // ── Create product ─────────────────────────────────────────────────────────
  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const created = await createProduct({
        product_name: newProduct.product_name,
        barcode: newProduct.barcode,
        description: newProduct.description,
        price: Number(newProduct.price),
        in_stock: Number(newProduct.in_stock),
        status: newProduct.status,
        entrepreneur_id: user!.entrepreneur_id!,
        category_id: newProduct.category_id
          ? Number(newProduct.category_id)
          : null,
        barcode: newProduct.barcode,
      });

      // Upload image if one was selected
      if (imageFile) {
        try {
          await uploadProductImage(created.product_id, imageFile);
        } catch {
          // Image upload failure shouldn't block product creation
          console.warn("Image upload failed — product created without image");
        }
      }

      // Add to local list
      setProducts((prev) => [created, ...prev]);

      // Reset form
      setNewProduct({
        product_name: "", barcode: "", description: "",
        price: "", in_stock: "", category_id: "", status: true,
      });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);

    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao criar produto."
      );
    } finally {
      setFormLoading(false);
    }
  }

  // ── Save button preset function ──────────────────────────────────────────────────
  async function handleSaveAppearance() {
    if (!user?.entrepreneur_id) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/registers/entrepreneurs/${user.entrepreneur_id}/appearance?banner_preset=${selectedPreset}`,
        { method: "PUT", headers: authHeader() }
      );
      setPresetSaved(true);
      setTimeout(() => setPresetSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  // ── Profile and Banner custom preset ──────────────────────────────────────────────────
  async function handleProfileUpload() {
    if (!profileFile || !user?.entrepreneur_id) return;
    setUploadingProfile(true);
    try {
      await uploadEntrepreneurProfile(user.entrepreneur_id, profileFile);
      setProfileFile(null);
      setPresetSaved(true);
      setTimeout(() => setPresetSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingProfile(false);
    }
  }

  async function handleBannerUpload() {
    if (!bannerFile || !user?.entrepreneur_id) return;
    setUploadingBanner(true);
    try {
      await uploadEntrepreneurBanner(user.entrepreneur_id, bannerFile);
      setBannerFile(null);
      setPresetSaved(true);
      setTimeout(() => setPresetSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleClearBanner() {
    if (!user?.entrepreneur_id) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/registers/entrepreneurs/${user.entrepreneur_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeader(),
          },
          body: JSON.stringify({ banner_image: null }),
        }
      );
      if (!res.ok) throw new Error("Failed to clear banner");
      setPresetSaved(true);
      setTimeout(() => setPresetSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  // ── Store name update handler ──────────────────────────────────────────────────
  async function handleSaveStoreInfo() {
    if (!user?.entrepreneur_id) return;
    setSavingName(true);
    try {
      const data: { store_name?: string; phone?: string } = {};
      if (storeName.trim()) data.store_name = storeName.trim();
      if (storePhone.trim()) data.phone = storePhone.trim();
      if (Object.keys(data).length === 0) return;
      await updateEntrepreneur(user.entrepreneur_id, data);
      setPresetSaved(true);
      setTimeout(() => setPresetSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  }

  // ── Toggle product status ──────────────────────────────────────────────────
  async function handleToggleStatus(product: Product) {
    try {
      const updated = await updateProduct(product.product_id, {
        status: !product.status,
      });
      setProducts((prev) =>
        prev.map((p) => (p.product_id === product.product_id ? updated : p))
      );
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  }

  // ── Delete product ─────────────────────────────────────────────────────────
  async function handleDelete(product_id: number) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteProduct(product_id);
      setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Olá, {user.first_name}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Painel do empreendedor — gerencie seus produtos e vendas
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setTab("products"); }}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          + Novo produto
        </button>
        {user.entrepreneur_id && (
          <Link
            href={`/loja/${user.entrepreneur_id}`}
            className="h-10 px-4 rounded-xl border border-border text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
          >
            🏪 Ver minha loja
          </Link>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-8 w-fit">
        {(["overview", "products", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "overview" ? "Visão Geral" : t === "products" ? "Produtos" : "Pedidos"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1 — OVERVIEW
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="flex flex-col gap-6">

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Produtos ativos", value: activeProducts, icon: "📦", color: "text-blue-600" },
              { label: "Total de pedidos", value: orders.length, icon: "🛒", color: "text-purple-600" },
              { label: "Pedidos concluídos", value: completedOrders, icon: "✅", color: "text-green-600" },
              { label: "Faturamento total", value: formatPrice(totalSales), icon: "💰", color: "text-primary" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{kpi.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Store name upgrade */}
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              Informações da loja
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">
                  Nome da loja
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ex: Doces da Mari"
                  maxLength={100}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">
                  Telefone do negócio
                </label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => {
                    const masked = e.target.value
                      .replace(/\D/g, "").slice(0, 11)
                      .replace(/(\d{2})(\d)/, "($1) $2")
                      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
                    setStorePhone(masked);
                  }}
                  placeholder="(48) 99999-9999"
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveStoreInfo}
                  disabled={savingName || (!storeName.trim() && !storePhone.trim())}
                  className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingName ? "Salvando..." : "Salvar informações"}
                </button>
                {presetSaved && (
                  <span className="text-sm text-green-600 font-medium">✓ Salvo!</span>
                )}
              </div>
            </div>
          </div>

          {/* Profile picture upload */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">
                Foto de perfil
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                />
                {profileFile && (
                  <button
                    onClick={handleProfileUpload}
                    disabled={uploadingProfile}
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {uploadingProfile ? "Enviando..." : "Salvar foto"}
                  </button>
                )}
              </div>
            </div>

            {/* Custom banner upload */}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">
                Banner personalizado
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                />
                {bannerFile && (
                  <button
                    onClick={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {uploadingBanner ? "Enviando..." : "Salvar banner"}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ou escolha um tema abaixo
              </p>
            </div>
          </div>

          {/* Banner preset selection*/}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">
              Aparência da loja
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha um tema para o banner da sua loja:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={`h-16 rounded-xl ${preset.style} border-2 transition-colors ${
                    selectedPreset === preset.id
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedPreset(preset.id)}
                  title={preset.name}
                />
              ))}
            </div>
            {selectedPreset && (
              <p className="text-xs text-muted-foreground mt-2">
                Selecionado: {BANNER_PRESETS.find(p => p.id === selectedPreset)?.name}
              </p>
            )}
          </div>

          {/* Save button of Presets */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSaveAppearance}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Salvar aparência
            </button>

            {/* Clear custom banner — only shows if a custom banner exists */}
            <button
              onClick={handleClearBanner}
              className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            >
              Remover banner personalizado
            </button>

            {presetSaved && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Salvo!
              </span>
            )}
          </div>

          {/* Recent products */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Produtos recentes</h2>
              <button
                onClick={() => setTab("products")}
                className="text-sm text-primary hover:underline"
              >
                Ver todos →
              </button>
            </div>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                Nenhum produto cadastrado ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.in_stock} em estoque
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(Number(product.price))}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        product.status
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {product.status ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Pedidos recentes</h2>
              <button
                onClick={() => setTab("orders")}
                className="text-sm text-primary hover:underline"
              >
                Ver todos →
              </button>
            </div>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                Nenhum pedido recebido ainda.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.orders_id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Pedido #{order.orders_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(Number(order.order_total))}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {order.status ? "Concluído" : "Pendente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2 — PRODUCTS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "products" && (
        <div className="flex flex-col gap-6">

          {/* Success message */}
          {formSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                ✓ Produto criado com sucesso!
              </p>
            </div>
          )}

          {/* Add product button */}
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">
              Meus produtos ({products.length})
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {showForm ? "Cancelar" : "+ Novo produto"}
            </button>
          </div>

          {/* ── New product form ─────────────────────────────────────────── */}
          {showForm && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-5">
                Cadastrar novo produto
              </h3>
              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Nome do produto *</label>
                  <input
                    type="text"
                    value={newProduct.product_name}
                    onChange={(e) => setNewProduct((p) => ({ ...p, product_name: e.target.value }))}
                    placeholder="Ex: Geleia de Morango Artesanal"
                    required
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Código de barras *</label>
                  <input
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct((p) => ({ ...p, barcode: e.target.value }))}
                    placeholder="1234567890123"
                    required
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct((p) => ({ ...p, category_id: e.target.value }))}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Descrição *</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Descreva seu produto..."
                    required
                    rows={3}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Preço (R$) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    placeholder="29.90"
                    required
                    min="0"
                    step="0.01"
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Estoque *</label>
                  <input
                    type="number"
                    value={newProduct.in_stock}
                    onChange={(e) => setNewProduct((p) => ({ ...p, in_stock: e.target.value }))}
                    placeholder="50"
                    required
                    min="0"
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Imagem do produto
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou WebP — máx. 5MB
                  </p>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={newProduct.status}
                    onChange={(e) => setNewProduct((p) => ({ ...p, status: e.target.checked }))}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                  <label htmlFor="status" className="text-sm text-foreground">
                    Disponível para venda imediatamente
                  </label>
                </div>

                {formError && (
                  <div className="sm:col-span-2 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                    <p className="text-destructive text-sm">{formError}</p>
                  </div>
                )}

                <div className="sm:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {formLoading ? "Criando..." : "Criar produto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-10 px-6 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products list */}
          {products.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não tem produtos cadastrados.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Criar primeiro produto
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {product.product_name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        product.status
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {product.status ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(Number(product.price))} · {product.in_stock} em estoque
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View */}
                    <Link
                      href={`/products/${product.product_id}`}
                      className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      title="Ver produto"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Link>

                    {/* Toggle status */}
                    <button
                      onClick={() => handleToggleStatus(product)}
                      className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      title={product.status ? "Desativar" : "Ativar"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {product.status
                          ? <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                          : <circle cx="12" cy="12" r="10" />
                        }
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive transition-colors text-muted-foreground hover:text-destructive"
                      title="Excluir produto"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3 — ORDERS
      ════════════════════════════════════════════════════════════════════ */}
      {tab === "orders" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-foreground">
            Todos os pedidos ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum pedido recebido ainda.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div
                  key={order.orders_id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Pedido #{order.orders_id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cliente #{order.client_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground text-sm">
                      {formatPrice(Number(order.order_total))}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {order.status ? "Concluído" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}