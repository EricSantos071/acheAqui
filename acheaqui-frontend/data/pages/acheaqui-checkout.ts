import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiCheckoutPage: PartnerPageConfig = {
  type: "partner",
  slug: "checkout",

  metadata: {
    title: "Checkout — AcheAqui",
    description: "Finalize seu pedido de forma segura.",
  },

  partner: {
    name: "AcheAqui",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Finalização do Pedido.",
  },

  hero: {
    title: "Finalizar Pedido",
    subtitle: "Etapa Final",
    description: "Confirme seus dados de entrega e escolha a forma de pagamento.",
    badge: "Ambiente Seguro",
    ctas: [],
    image: {
      src: "/images/ui/checkout-lock.png",
      alt: "Cadeado de segurança",
    },
  },

  bigQuote: {
    quote: "Seu pagamento é processado com criptografia de ponta a ponta.",
    author: "Segurança AcheAqui",
    role: "Protocolo",
    company: "Pagamentos",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Resumo Financeiro",
    items: [
      { icon: "tag", title: "Subtotal", description: "R$ 25,00" },
      { icon: "truck", title: "Frete", description: "R$ 7,00" },
      { icon: "credit-card", title: "Total", description: "R$ 32,00" },
    ],
  },

  form: {
    title: "Dados de Entrega e Pagamento",
    fields: [
      { name: "address", label: "Endereço Completo", type: "text", required: true },
      { name: "city", label: "Cidade", type: "text", required: true },
      { 
        name: "payment", 
        label: "Forma de Pagamento", 
        type: "select", 
        options: [
          { label: "Pix (Aprovação Imediata)", value: "pix" },
          { label: "Cartão de Crédito", value: "card" },
          { label: "Boleto", value: "boleto" }
        ],
        required: true 
      },
    ],
    submitLabel: "Confirmar e Pagar",
  },

  contentBlocks: [],
  socialProof: { stats: [], testimonials: [] },
  offer: {
    title: "Precisa de Ajuda?",
    description: "Nosso suporte está disponível via WhatsApp para finalizar sua compra.",
    cta: { label: "Chamar Suporte", href: "#", variant: "secondary" },
  },
};