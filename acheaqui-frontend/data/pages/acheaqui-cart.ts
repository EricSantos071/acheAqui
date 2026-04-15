import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiCartPage: PartnerPageConfig = {
  type: "partner",
  slug: "carrinho",

  metadata: {
    title: "Seu Carrinho — AcheAqui",
    description: "Revise seus produtos antes de finalizar a compra.",
  },

  partner: {
    name: "AcheAqui Marketplace",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Checkout Seguro.",
  },

  hero: {
    title: "Seu Carrinho",
    subtitle: "Total: R$ 25,00",
    description: "Você tem 1 item no seu carrinho de 'Doces da Mari'.",
    badge: "Resumo da Compra",
    ctas: [
      { label: "Finalizar Compra", href: "/checkout", variant: "default" },
      { label: "Continuar Comprando", href: "/", variant: "secondary" },
    ],
    image: {
      src: "/images/ui/cart-illustration.png",
      alt: "Ilustração de carrinho de compras",
    },
  },

  bigQuote: {
    quote: "Apoiar o comércio local é investir na sua própria comunidade.",
    author: "Equipe AcheAqui",
    role: "Marketplace",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Itens no Carrinho",
    items: [
      { icon: "shopping-bag", title: "Geleia de Morango", description: "1x R$ 25,00" },
    ],
  },

  contentBlocks: [],
  socialProof: { stats: [], testimonials: [] },
  offer: {
    title: "Cupom de Desconto?",
    description: "Você poderá inserir seu cupom na próxima etapa.",
    cta: { label: "Ir para Checkout", href: "/checkout", variant: "default" },
  },
};