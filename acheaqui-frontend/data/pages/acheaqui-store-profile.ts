import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiStoreProfilePage: PartnerPageConfig = {
  type: "partner",
  slug: "loja-exemplo", // View at /loja-exemplo

  metadata: {
    title: "Doces da Mari — AcheAqui",
    description: "Confira os produtos artesanais da Mari.",
  },

  partner: {
    name: "Doces da Mari",
    logo: "https://github.com/octocat.png",
    logoDark: "https://github.com/octocat.png",
    description: "O melhor doce caseiro da cidade.",
  },

  hero: {
    title: "Doces da Mari",
    subtitle: "Handmade Sweets",
    description: "Geleias, bolos e doces finos feitos com amor e ingredientes locais.",
    badge: "Loja Verificada",
    ctas: [{ label: "Ver Catálogo", href: "#products", variant: "default" }],
    image: {
      src: "/images/landing-pages/store/hero.png",
      alt: "Store banner",
    },
  },

  bigQuote: {
    quote: "Minha paixão é adoçar a vida dos meus vizinhos.",
    author: "Maria Silva",
    role: "Chef & Proprietária",
    company: "Doces da Mari",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Diferenciais da Loja",
    items: [
      { icon: "leaf", title: "100% Natural", description: "Sem conservantes artificiais." },
      { icon: "truck", title: "Entrega Local", description: "Chega fresquinho na sua porta." },
    ],
  },

  contentBlocks: [
    {
      title: "Nossos Produtos",
      subtitle: "Our Products",
      items: [
        { icon: "star", title: "Geleia de Morango", description: "R$ 25,00 - Pote 200g" },
        { icon: "star", title: "Bolo de Rolo", description: "R$ 45,00 - Tamanho G" },
        { icon: "star", title: "Brownie Artesanal", description: "R$ 8,00 - Unidade" },
        { icon: "star", title: "Trufas Variadas", description: "R$ 5,00 - Unidade" },
      ],
      columns: 2,
      variant: "cards",
    },
  ],

  socialProof: { 
    stats: [{ value: "4.9★", label: "Avaliação" }],
    testimonials: [
      { quote: "A melhor geleia que já comi!", author: "Carlos", role: "Cliente Fiel", company: "AcheAqui" }
    ] 
  },

  offer: {
    title: "Encomendas Especiais?",
    description: "Fazemos kits para festas e eventos corporativos.",
    cta: { label: "Pedir Orçamento", href: "/fale-conosco", variant: "secondary" },
  },
};