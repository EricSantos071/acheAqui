// ── data/pages/index.ts ───────────────────────────────────────────────────────
// Page registry for AcheAqui.
// IMPORTANT: Keep getPageBySlug and getAllPageSlugs — they are required by
// src/app/[...slug]/page.tsx for Next.js dynamic routing to work.
import type { PageConfig } from "@/types/page-config";

// ── AcheAqui pages ────────────────────────────────────────────────────────────
import { acheaquiHomePage } from "./acheaqui-home";

// 14.04.26 NEW PAGE ADDED TO TEST OUT A FRONTEND WHILE CLAUDE LOADS TOKENS LOL
import { acheaquiPreviewPage } from "./acheaqui-preview";
import { acheaquiLoginPage } from "./acheaqui-login";
import { acheaquiRegisterPage } from "./acheaqui-register";
import { acheaquiStoreProfilePage } from "./acheaqui-store-profile";
// 15/04/26 New Pages!
import { acheaquiProductDetailPage } from "./acheaqui-product-detail";
import { acheaquiCartPage } from "./acheaqui-cart";
import { acheaquiCheckoutPage } from "./acheaqui-checkout";
import { acheaquiDashboardPage } from "./acheaqui-dashboard";
import { acheaquiSuccessPage } from "./acheaqui-success";

// ── Example pages (kept as reference, not rendered unless slug is visited) ────
// import { examplePartnerPage } from "./examples/example-partner";

// ── Page registry ─────────────────────────────────────────────────────────────
// Add new pages here as you build them — the slug in each config
// determines the URL it lives at (e.g. slug: "home" → /home)
export const pages: PageConfig[] = [
  acheaquiHomePage,
  // 14.04.26 NEW PAGE ADDED TO SELECTION
  acheaquiPreviewPage,
  acheaquiLoginPage,
  acheaquiRegisterPage,
  acheaquiStoreProfilePage,
  // 15/04/26 Pagination
  acheaquiProductDetailPage,
  acheaquiCartPage,
  acheaquiCheckoutPage,
  acheaquiDashboardPage,
  acheaquiSuccessPage,
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