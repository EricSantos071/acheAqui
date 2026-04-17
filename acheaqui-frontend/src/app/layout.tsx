// ── src/app/layout.tsx ────────────────────────────────────────────────────────
// Root layout — wraps EVERY page in the app automatically.
// Think of it as the permanent frame: navbar on top, footer on bottom,
// your page content fills the middle.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── Fonts ──────────────────────────────────────────────────────────────────────
// Geist is a clean, modern font — works great for marketplace feel
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ── Default SEO metadata ───────────────────────────────────────────────────────
// Individual pages can override this with their own metadata export
export const metadata: Metadata = {
  title: "AcheAqui — Marketplace Local",
  description:
    "Encontre produtos locais perto de você. Compre de empreendedores da sua cidade.",
  keywords: ["marketplace", "local", "empreendedores", "produtos locais"],
};

// ── Root layout component ──────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Navbar — always visible at the top */}
        <Navbar />

        {/* Page content — grows to fill available space */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer — always at the bottom */}
        <Footer />
      </body>
    </html>
  );
}