// ── src/config/site.ts ────────────────────────────────────────────────────────
// Global site configuration for AcheAqui
// This file controls the navbar, footer, logo and SEO defaults

export const siteConfig = {
  name: "AcheAqui",
  description:
    "Encontre produtos locais perto de você. Compre de empreendedores da sua cidade.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // ── Logo ───────────────────────────────────────────────────────────────────
  // Replace both paths with your real logo files when ready
  // Recommended: SVG or PNG, transparent background, ~160x40px
  logo: {
    light: "/images/acheaqui-logo.png",   // shown on light backgrounds
    dark: "/images/acheaqui-logo.png",    // shown on dark backgrounds
    height: 36,
  },

  // ── Navigation ─────────────────────────────────────────────────────────────
  nav: [
    { label: "Produtos", href: "/products" },
    { label: "Categorias", href: "/categories" },
    { label: "Empreendedores", href: "/entrepreneurs" },
    { label: "Sobre", href: "/about" },
  ],

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    company: "AcheAqui Marketplace",
    links: [
      { label: "Política de Privacidade", href: "/privacy" },
      { label: "Termos de Uso", href: "/terms" },
      { label: "Fale Conosco", href: "/contact" },
      { label: "Seja um Empreendedor", href: "/register" },
    ],
  },
};