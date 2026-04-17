// ── src/app/page.tsx ──────────────────────────────────────────────────────────
// Homepage — the / route.
// This is a placeholder that redirects to /products for now.
// We will replace this with the full homepage (carousel, categories etc)
// based on acheaqui-preview.ts reference in the next step.

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/products");
}