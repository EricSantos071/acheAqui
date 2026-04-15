import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiPreviewPage: PartnerPageConfig = {
  type: "partner",
  slug: "preview", // You will view this at /preview

  metadata: {
    title: "AcheAqui — Preview Layout",
    description: "Template preview with carousels and minimalist countryside style.",
  },

  partner: {
    name: "AcheAqui Marketplace",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Encontre o que você precisa, perto de você.",
  },

  // ── Hero with Countryside Banner ────────────────────────────────────────────
  hero: {
    title: "Landing Page Templates",
    subtitle: "Data-driven campaign pages",
    description: "Lead generation, promotions, and partner marketing.",
    badge: "Minimalist Style",
    // image: {
    //   // Assuming you'll place the countryside art here
    //   src: "/images/minimalist-countryside-banner.png", 
    //   alt: "Minimalist countryside background",
    // },
    ctas: [
      { label: "Login / Register", href: "/login", variant: "default" },
    ],
    image: {
      src: "/images/landing-pages/home/hero.png",
      alt: "Preview banner art",
    },
  },

  // ADDING THESE BACK to satisfy the "PartnerPageConfig" requirements
  bigQuote: {
    quote: "Testing the new layout features.",
    author: "Preview System",
    role: "Admin",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  // ── Carousels (Mapped to Content Blocks) ────────────────────────────────────
  contentBlocks: [
    {
      title: "Carrousel of Stores registered",
      subtitle: "Nossas lojas parceiras",
      items: [
        { icon: "shopping-bag", title: "Loja Exemplo 1", description: "Descrição da loja." },
        { icon: "shopping-bag", title: "Loja Exemplo 2", description: "Descrição da loja." },
        { icon: "shopping-bag", title: "Loja Exemplo 3", description: "Descrição da loja." },
      ],
      columns: 3,
      variant: "cards",
    },
    {
      title: "Carrousel of Products on Sale",
      subtitle: "Ofertas imperdíveis",
      items: [
        { icon: "tag", title: "Produto A", description: "10% OFF" },
        { icon: "tag", title: "Produto B", description: "20% OFF" },
        { icon: "tag", title: "Produto C", description: "5% OFF" },
      ],
      columns: 3,
      variant: "cards",
    },
  ],

  // ── Bottom Section (Enterprise Ad + Postal Card) ──────────────────────────
  socialProof: {
    stats: [
      { value: "Empresas", label: "Cadastre-se agora e venda mais!" },
    ],
    testimonials: [
      {
        quote: "This is the 'About Us' as a Postal Card: We are AcheAqui, connecting you to the best local entrepreneurs.",
        author: "Equipe AcheAqui",
        role: "Quem Somos",
        company: "AcheAqui Marketplace",
      },
    ],
  },

  offer: {
    title: "Quer vender no AcheAqui?",
    description: "To enterprises who wanna register here!",
    cta: {
      label: "Cadastrar meu negócio",
      href: "/register",
      variant: "default",
    },
  },

  form: {
    title: "Newsletter",
    fields: [],
    submitLabel: "Submit",
  },
};