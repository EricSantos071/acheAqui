"use client";

// ── src/app/success/page.tsx ──────────────────────────────────────────────────
// Order success page — /success
// Receives order details via URL query params from checkout:
//   /success?order_id=1&method=pix&total=57.00

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import jsPDF from "jspdf";

// ── Payment method display info ────────────────────────────────────────────────
const METHOD_INFO: Record<string, { label: string; instruction: string; icon: string }> = {
  pix: {
    label: "Pix",
    instruction: "O QR Code Pix foi enviado para seu e-mail. Pague em até 30 minutos.",
    icon: "⚡",
  },
  credit_card: {
    label: "Cartão de Crédito",
    instruction: "Seu pagamento está sendo processado. Você receberá a confirmação por e-mail.",
    icon: "💳",
  },
  boleto: {
    label: "Boleto Bancário",
    instruction: "O boleto foi enviado para seu e-mail. Vence em 3 dias úteis.",
    icon: "📄",
  },
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const method = searchParams.get("method") ?? "pix";
  const total = searchParams.get("total");

  const methodInfo = METHOD_INFO[method] ?? METHOD_INFO.pix;

  const formatPrice = (price: string | null) => {
    if (!price) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));
  };

  function downloadReceipt() {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("AcheAqui — Comprovante de Pedido", 20, 20);
    doc.setFontSize(12);
    doc.text(`Pedido #${orderId}`, 20, 40);
    doc.text(`Total: ${formatPrice(total)}`, 20, 50);
    doc.text(`Pagamento: ${methodInfo.label}`, 20, 60);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 70);
    doc.text("Obrigado por apoiar o comércio local!", 20, 90);

    doc.save(`comprovante-pedido-${orderId}.pdf`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg text-center">

        {/* ── Success icon ──────────────────────────────────────────────── */}
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-600"
          >
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── Heading ───────────────────────────────────────────────────── */}
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Pedido confirmado! 🎉
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Obrigado por apoiar o comércio local. Seu pedido foi recebido com sucesso.
        </p>

        {/* ── Order details card ────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-left">

          {/* Download Receipt button */}
          <button
            onClick={downloadReceipt}
            className="w-full h-10 rounded-xl border border-border text-sm text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2 mb-4"
          >
            📄 Baixar comprovante PDF
          </button>

          {/* Order number */}
          {orderId && (
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">Número do pedido</span>
              <span className="font-semibold text-foreground">#{orderId}</span>
            </div>
          )}

          {/* Total */}
          {total && (
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold text-primary">{formatPrice(total)}</span>
            </div>
          )}

          {/* Payment method */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
            <span className="text-sm text-muted-foreground">Pagamento</span>
            <span className="font-medium text-foreground">
              {methodInfo.icon} {methodInfo.label}
            </span>
          </div>

          {/* Payment instruction */}
          <div className="bg-muted rounded-xl p-4">
            <p className="text-sm text-foreground font-medium mb-1">
              Próximo passo:
            </p>
            <p className="text-sm text-muted-foreground">
              {methodInfo.instruction}
            </p>
          </div>
        </div>

        {/* ── Order tracking timeline ───────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-foreground mb-4 text-sm">
            Acompanhe seu pedido
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: "✅", label: "Pedido recebido", done: true },
              { icon: "💰", label: "Aguardando pagamento", done: false },
              { icon: "📦", label: "Em preparação", done: false },
              { icon: "🚚", label: "Saiu para entrega", done: false },
              { icon: "🏠", label: "Entregue", done: false },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-base">{step.icon}</span>
                <span
                  className={`text-sm ${
                    step.done
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {step.done && (
                  <span className="ml-auto text-xs text-green-600 font-medium">
                    Concluído
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Continuar comprando
          </Link>
          <Link
            href="/"
            className="h-11 px-6 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center justify-center"
          >
            Voltar ao início
          </Link>
        </div>

        {/* ── Social sharing nudge ──────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground mt-6">
          Gostou da experiência? Compartilhe e marque{" "}
          <span className="text-primary">@AcheAqui</span> nas redes! 🌱
        </p>
      </div>
    </div>
  );
}

// Suspense wrapper required because useSearchParams needs it in Next.js 15
export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-muted-foreground text-sm animate-pulse">
            Carregando...
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}