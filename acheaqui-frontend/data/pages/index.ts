// ── data/pages/index.ts ───────────────────────────────────────────────────────
// Page registry for AcheAqui.
// IMPORTANT: Keep getPageBySlug and getAllPageSlugs — they are required by
// src/app/[...slug]/page.tsx for Next.js dynamic routing to work.

import type { PageConfig } from "@/types/page-config";

// ── AcheAqui pages ────────────────────────────────────────────────────────────
import { acheaquiHomePage } from "./acheaqui-home";

// ── Example pages (kept as reference, not rendered unless slug is visited) ────
// import { examplePartnerPage } from "./examples/example-partner";

// ── Page registry ─────────────────────────────────────────────────────────────
// Add new pages here as you build them — the slug in each config
// determines the URL it lives at (e.g. slug: "home" → /home)
export const pages: PageConfig[] = [
  acheaquiHomePage,

  // Phases ahead:
  // acheaquiProductsPage,    ← Phase 2
  // acheaquiLoginPage,       ← Phase 4
  // acheaquiRegisterPage,    ← Phase 4
  // acheaquiCartPage,        ← Phase 5
  // acheaquiDashboardPage,   ← Phase 6
];

// ── Helper: get a single page by its slug ────────────────────────────────────
// Used by src/app/[...slug]/page.tsx to render the right page
// e.g. visiting /home → finds the page with slug: "home"
export function getPageBySlug(slug: string): PageConfig | undefined {
  return pages.find((page) => page.slug === slug);
}

// ── Helper: get all slugs for static generation ───────────────────────────────
// Used by Next.js generateStaticParams to pre-render all pages at build time
// Returns format Next.js expects: [{ slug: ["home"] }, { slug: ["products"] }]
export function getAllPageSlugs(): string[] {
  return pages.map((page) => page.slug);
}