"use client";

// ── src/app/page.tsx ──────────────────────────────────────────────────────────
// AcheAqui Homepage — /
//
// Sections:
//   1. Hero         → headline + search bar + CTAs
//   2. Categories   → dynamic from GET /inventory/category
//   3. Featured     → dynamic from GET /inventory/products (newest)
//   4. Entrepreneur → CTA to register as seller
//   5. Newsletter   → email capture

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCategories, getProducts, getProductsWithImages } from "@/lib/api";
import ProductCard from "./products/ProductCard";
import type { Category, Product } from "@/types";

export default function HomePage() {
  const router = useRouter();

  // ── Search state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Data state ─────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Newsletter state ───────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  // ── Fetch data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProductsWithImages({ limit: 8, status: true, page: 1 }),
        ]);

        //Debug phone test
        // console.log("Categories:", cats);
        // console.log("Products response:", prods);
        // console.log("Products count:", prods?.data?.length);

        setCategories(cats.data);
        setFeatured(prods.data);
      } catch (err) {
        console.error("Homepage fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Search submit ──────────────────────────────────────────────────────────
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/products");
    }
  }

  // ── Newsletter submit (placeholder) ───────────────────────────────────────
  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterSent(true);
    setEmail("");
  }

  // ── Category emoji map ─────────────────────────────────────────────────────
  const categoryIcons: Record<string, string> = {
    artesanato: "🎨",
    gastronomia: "🍯",
    orgânicos: "🌱",
    moda: "👗",
    casa: "🏠",
    presentes: "🎁",
    tecnologia: "💻",
    beleza: "✨",
    esporte: "⚽",
    livros: "📚",
  };

  function getCategoryIcon(name: string): string {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lower.includes(key)) return icon;
    }
    return "🛍️";
  }

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-secondary py-20 px-4">

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="max-w-4xl mx-auto text-center relative">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            🌱 Marketplace local de Mafra
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            Encontre produtos{" "}
            <span className="text-primary">locais</span>{" "}
            perto de você
          </h1>

          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Compre diretamente de empreendedores da sua cidade.
            Produtos únicos, entrega rápida e apoio ao comércio local.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2 bg-card border border-border rounded-2xl p-2 shadow-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos, lojas ou categorias..."
                className="flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Explorar produtos →
            </Link>
            <Link
              href="/register"
              className="h-11 px-6 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-accent transition-colors"
            >
              Vender no AcheAqui
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">✅ Pagamento seguro</span>
            <span className="flex items-center gap-1.5">🚚 Entrega local rápida</span>
            <span className="flex items-center gap-1.5">⭐ Produtos verificados</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. CATEGORIES SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Explore por categoria
            </h2>
            <p className="text-muted-foreground text-sm">
              Encontre exatamente o que você procura
            </p>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            // Fallback static categories
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Artesanato", icon: "🎨" },
                { name: "Gastronomia", icon: "🍯" },
                { name: "Orgânicos", icon: "🌱" },
                { name: "Moda local", icon: "👗" },
                { name: "Casa", icon: "🏠" },
                { name: "Presentes", icon: "🎁" },
              ].map((cat) => (
                <Link
                  key={cat.name}
                  href={`/products`}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary hover:bg-accent transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <span className="text-xs font-medium text-foreground text-center">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.category_id}
                  href={`/products?category_id=${cat.category_id}`}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary hover:bg-accent transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.category_name)}
                  </span>
                  <span className="text-xs font-medium text-foreground text-center line-clamp-2">
                    {cat.category_name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. FEATURED PRODUCTS SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-1">
                Produtos em destaque
              </h2>
              <p className="text-muted-foreground text-sm">
                Selecionados para você
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm text-primary hover:underline font-medium hidden sm:block"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-5 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground mb-4">
                Nenhum produto disponível ainda.
              </p>
              <Link
                href="/register"
                className="text-primary font-medium text-sm hover:underline"
              >
                Seja o primeiro a vender →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8 sm:hidden">
                <Link
                  href="/products"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Ver todos os produtos →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. ENTREPRENEUR CTA SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">

          <div className="text-5xl mb-6">🚀</div>

          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Quer vender no AcheAqui?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Cadastre seu negócio gratuitamente e comece a vender para
            milhares de clientes na sua região. Sem taxas de adesão.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: "💰", title: "Sem mensalidade", desc: "Cadastro 100% gratuito" },
              { icon: "📦", title: "Gestão simples", desc: "Painel intuitivo" },
              { icon: "🌍", title: "Alcance local", desc: "Clientes na sua cidade" },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="bg-primary-foreground/10 rounded-xl p-4 text-primary-foreground"
              >
                <div className="text-2xl mb-2">{benefit.icon}</div>
                <p className="font-semibold text-sm">{benefit.title}</p>
                <p className="text-xs text-primary-foreground/70 mt-1">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/register"
            className="inline-flex h-12 px-8 rounded-xl bg-primary-foreground text-primary text-sm font-semibold hover:opacity-90 transition-opacity items-center"
          >
            Cadastrar meu negócio grátis →
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. NEWSLETTER SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-2xl mx-auto text-center">

          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Fique por dentro das novidades
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Receba ofertas exclusivas e novos produtos diretamente no seu e-mail.
          </p>

          {newsletterSent ? (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-6 py-4">
              <p className="text-green-700 dark:text-green-400 font-medium">
                ✓ Obrigado! Você receberá nossas novidades em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                className="flex-1 h-11 rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Quero receber
              </button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Sem spam. Cancele quando quiser.
          </p>
        </div>
      </section>

    </div>
  );
}