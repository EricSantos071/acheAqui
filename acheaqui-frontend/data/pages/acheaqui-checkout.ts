import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiCheckoutPage: PartnerPageConfig = {
  type: "partner",
  slug: "checkout",

  metadata: {
    title: "Checkout — AcheAqui",
    description: "Finalize seu pedido com segurança e escolha sua entrega.",
  },

  partner: {
    name: "AcheAqui",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Finalização do Pedido.",
  },

  hero: {
    title: "Finalizar Pedido",
    subtitle: "Checkout",
    description: "Selecione seu bairro para calcular o frete exato e confirme seus dados.",
    badge: "Ambiente Seguro",
    ctas: [],
    image: {
      src: "/images/ui/checkout-lock.png",
      alt: "Cadeado de segurança",
    },
  },

  // ── Financial Summary with Dynamic Placeholders ────────────────────────────
  valueProposition: {
    title: "Resumo Financeiro",
    items: [
      { icon: "tag", title: "Subtotal", description: "R$ 57,00" },
      { 
        icon: "truck", 
        title: "Entrega (por bairro)", 
        description: "Selecione o bairro abaixo" 
      },
      { 
        icon: "credit-card", 
        title: "Total Estimado", 
        description: "R$ 57,00 + frete" 
      },
    ],
  },

  // ── Form with Neighborhood Selector ────────────────────────────────────────
  form: {
    title: "Dados de Entrega",
    fields: [
      { name: "name", label: "Nome Completo", type: "text", required: true },
      { 
        name: "neighborhood", 
        label: "Bairro para Entrega", 
        type: "select", 
        required: true,
        options: [
          { label: "Centro (Frete: R$ 5,00)", value: "centro" },
          { label: "Efapi (Frete: R$ 12,00)", value: "efapi" },
          { label: "Bela Vista (Frete: R$ 8,00)", value: "bela_vista" },
          { label: "Passo dos Fortes (Frete: R$ 7,00)", value: "passo_fortes" },
          { label: "Santa Maria (Frete: R$ 10,00)", value: "santa_maria" },
        ],
      },
      { name: "address", label: "Rua e Número", type: "text", required: true },
      { 
        name: "payment", 
        label: "Forma de Pagamento", 
        type: "select", 
        options: [
          { label: "Pix (Desconto 2%)", value: "pix" },
          { label: "Cartão de Crédito", value: "card" },
        ],
        required: true 
      },
    ],
    submitLabel: "Finalizar Compra",
  },

  bigQuote: {
    quote: "A tecnologia local encurta distâncias e fortalece nossos vizinhos.",
    author: "Equipe AcheAqui",
    role: "Logística",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  contentBlocks: [],
  socialProof: { stats: [], testimonials: [] },
  offer: {
    title: "Dúvidas no frete?",
    description: "O valor da entrega é repassado integralmente ao entregador parceiro.",
    cta: { label: "Saiba mais", href: "#", variant: "secondary" },
  },
};