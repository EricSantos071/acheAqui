// ── src/app/page.tsx ──────────────────────────────────────────────────────────
// Root homepage — redirects to /products for now.
// We will replace this with the full homepage in a later step.
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/products");
}