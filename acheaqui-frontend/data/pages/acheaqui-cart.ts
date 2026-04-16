import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiCartPage: PartnerPageConfig = {
  type: "partner",
  slug: "carrinho",

  metadata: {
    title: "Seu Carrinho Multi-loja — AcheAqui",
    description: "Revise seus produtos de diferentes vendedores locais.",
  },

  partner: {
    name: "AcheAqui Marketplace",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Consolidando seu apoio ao comércio local.",
  },

  hero: {
    title: "Seu Carrinho",
    subtitle: "Total: R$ 57,00",
    description: "Você está comprando de 2 lojas diferentes em sua região.",
    badge: "Itens de Lojas Locais",
    ctas: [
      { label: "Ir para Pagamento", href: "/checkout", variant: "default" },
    ],
    image: {
      src: "/images/ui/cart-multi.png",
      alt: "Carrinho com produtos variados",
    },
  },

  // ── Multi-Vendor Sections ──────────────────────────────────────────────────
  contentBlocks: [
    {
      title: "Vendedor: Doces da Mari",
      subtitle: "Frete para esta loja: R$ 7,00",
      items: [
        { icon: "shopping-bag", title: "Geleia de Morango", description: "1x R$ 25,00" },
        { icon: "shopping-bag", title: "Brownie Artesanal", description: "2x R$ 16,00" },
      ],
      columns: 1,
      variant: "cards",
    },
    {
      title: "Vendedor: Horta do Zé",
      subtitle: "Frete para esta loja: R$ 5,00",
      items: [
        { icon: "truck", title: "Cesta de Orgânicos P", description: "1x R$ 16,00" },
      ],
      columns: 1,
      variant: "cards",
    },
  ],

  // ── Financial Summary ──────────────────────────────────────────────────────
  valueProposition: {
    title: "Resumo do Pedido",
    items: [
      { icon: "tag", title: "Subtotal Produtos", description: "R$ 57,00" },
      { icon: "truck", title: "Total de Fretes (2 lojas)", description: "R$ 12,00" },
      { icon: "credit-card", title: "Total Geral", description: "R$ 69,00" },
    ],
  },

  bigQuote: {
    quote: "Comprar de múltiplos produtores locais fortalece toda a economia da nossa cidade.",
    author: "Equipe AcheAqui",
    role: "Marketplace",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  offer: {
    title: "Finalizar agora?",
    description: "Seus produtos ficarão reservados por 30 minutos.",
    cta: { label: "Finalizar Compra", href: "/checkout", variant: "default" },
  },

  socialProof: { stats: [], testimonials: [] },
};