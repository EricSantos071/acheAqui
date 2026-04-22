"use client";

// ── src/components/Navbar.tsx ─────────────────────────────────────────────────
// Now uses AuthContext instead of reading localStorage directly.
// This means it updates instantly when login/logout happens anywhere in the app.

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            AcheAqui
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Produtos
            </Link>
            <Link
              href="/lojas"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Lojas
            </Link>
            {user?.is_entrepreneur && (
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/carrinho"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  🛒 Carrinho
                </Link>
                <span className="text-sm text-foreground font-medium">
                  Olá, {user.first_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border flex flex-col gap-3">
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMenuOpen(false)}>
              Produtos
            </Link>
            <Link href="/lojas" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMenuOpen(false)}>
              Lojas
            </Link>
            {user?.is_entrepreneur && (
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link href="/carrinho" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMenuOpen(false)}>
                  🛒 Carrinho
                </Link>
                <button onClick={handleLogout} className="text-sm text-left text-muted-foreground hover:text-foreground py-2">
                  Sair ({user.first_name})
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
                <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground text-center" onClick={() => setMenuOpen(false)}>
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}