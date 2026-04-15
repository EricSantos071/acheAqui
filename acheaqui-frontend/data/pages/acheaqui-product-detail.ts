import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiProductDetailPage: PartnerPageConfig = {
  type: "partner",
  slug: "produto-geleia-morango", // Accessed via /produto-geleia-morango

  metadata: {
    title: "Geleia de Morango Artesanal — AcheAqui",
    description: "Geleia 100% natural, feita com frutas selecionadas da região.",
  },

  partner: {
    name: "Doces da Mari",
    logo: "https://github.com/octocat.png",
    logoDark: "https://github.com/octocat.png",
    description: "Vendido e entregue por Doces da Mari.",
  },

  hero: {
    title: "Geleia de Morango Artesanal",
    subtitle: "R$ 25,00",
    description: "Pote de 200g. Sem conservantes, corantes ou aromatizantes artificiais. Perfeita para cafés da manhã e sobremesas.",
    badge: "Mais Vendido",
    ctas: [
      { label: "Comprar Agora", href: "/carrinho", variant: "default" },
    ],
    image: {
      src: "/images/products/geleia-morango.png",
      alt: "Pote de geleia de morango em uma mesa de madeira",
    },
  },

  // Satisfying the mandatory structure
  bigQuote: {
    quote: "Usamos apenas frutas colhidas no dia para garantir o frescor.",
    author: "Mariana Silva",
    role: "Produtora",
    company: "Doces da Mari",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Detalhes do Produto",
    items: [
      { icon: "leaf", title: "Ingredientes", description: "Morango, açúcar orgânico e limão." },
      { icon: "shield", title: "Validade", description: "6 meses após a fabricação." },
      { icon: "truck", title: "Entrega", description: "Disponível para entrega no mesmo dia." },
    ],
  },

  contentBlocks: [
    {
      title: "Sugestões de Uso",
      items: [
        { icon: "star", title: "Com Torradas", description: "O clássico do café da manhã." },
        { icon: "star", title: "Com Queijo", description: "Uma combinação sofisticada para petiscos." },
      ],
      columns: 2,
      variant: "cards",
    },
  ],

  socialProof: {
    stats: [{ value: "4.9", label: "Média de Avaliações" }],
    testimonials: [
      { quote: "Melhor geleia que já provei!", author: "Alice", role: "Cliente", company: "AcheAqui" }
    ],
  },

  offer: {
    title: "Quer economizar no frete?",
    description: "Adicione mais produtos da Doces da Mari ao seu carrinho.",
    cta: { label: "Ver mais da loja", href: "/loja-exemplo", variant: "secondary" },
  },
};