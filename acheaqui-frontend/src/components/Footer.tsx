// ── src/components/Footer.tsx ─────────────────────────────────────────────────
// Bottom footer — visible on every page.
// No auth state needed here — purely static links.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Brand ─────────────────────────────────────────────────────── */}
          <div>
            <p className="text-lg font-semibold text-primary mb-2">AcheAqui</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conectando você aos melhores empreendedores locais da sua cidade.
            </p>
          </div>

          {/* ── Links ─────────────────────────────────────────────────────── */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Navegação</p>
            <div className="flex flex-col gap-2">
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Produtos
              </Link>
              <Link href="/lojas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Lojas
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Seja um Empreendedor
              </Link>
            </div>
          </div>

          {/* ── Legal ─────────────────────────────────────────────────────── */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Legal</p>
            <div className="flex flex-col gap-2">
              <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </Link>
              <Link href="/contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fale Conosco
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────────── */}
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AcheAqui Marketplace. Apoie o comércio local. 🌱
          </p>
        </div>
      </div>
    </footer>
  );
}