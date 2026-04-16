import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiSuccessPage: PartnerPageConfig = {
  type: "partner",
  slug: "success",

  metadata: {
    title: "Pedido Confirmado — AcheAqui",
    description: "Obrigado por apoiar o comércio local!",
  },

  partner: {
    name: "AcheAqui Marketplace",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Pedido #1204 - Sucesso!",
  },

  hero: {
    title: "Tudo certo com seu pedido!",
    subtitle: "Order Confirmed",
    description: "Obrigado por comprar na Doces da Mari. Você receberá atualizações em tempo real via e-mail e WhatsApp.",
    badge: "🎉 Sucesso",
    ctas: [
      { label: "Voltar para Início", href: "/", variant: "secondary" },
    ],
    image: {
      src: "/images/ui/success-celebration.png",
      alt: "Ilustração de celebração",
    },
  },

  // ── Tracking Timeline ──────────────────────────────────────────────────────
  // We use contentBlocks to represent the status sequence
  contentBlocks: [
    {
      title: "Acompanhe seu Pedido",
      subtitle: "Status do seu pacote",
      items: [
        { 
          icon: "check-circle", 
          title: "Pedido Realizado", 
          description: "Recebemos sua solicitação e os itens foram reservados. (Hoje, 14:30)" 
        },
        { 
          icon: "credit-card", 
          title: "Pagamento Confirmado", 
          description: "Seu pagamento via Pix foi validado com sucesso. (Hoje, 14:32)" 
        },
        { 
          icon: "truck", 
          title: "Saiu para Entrega", 
          description: "O entregador já coletou seu pedido e está a caminho! (Previsão: 30-40 min)" 
        },
      ],
      columns: 1,
      variant: "cards",
    },
  ],

  bigQuote: {
    quote: "Cada compra no AcheAqui gera impacto direto na vida de um produtor local.",
    author: "Impacto Social",
    role: "Nosso Propósito",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "O que acontece agora?",
    items: [
      { icon: "bell", title: "Notificações", description: "Avisaremos você quando o entregador estiver chegando." },
      { icon: "star", title: "Avalie", description: "Após receber, conte para nós como foi sua experiência." },
    ],
  },

  socialProof: { stats: [], testimonials: [] },
  offer: {
    title: "Gostou da experiência?",
    description: "Compartilhe sua compra nas redes sociais e marque a @AcheAqui!",
    cta: { label: "Compartilhar", href: "#", variant: "default" },
  },
};