import type { PartnerPageConfig } from "@/types/page-config";

// ── AcheAqui Homepage ──────────────────────────────────────────────────────────
// Adapted from example-partner.ts
// Language: pt-BR primary, English secondary
// To register this page: add to data/pages/index.ts
// Live at: / (root) or /home while building

export const acheaquiHomePage: PartnerPageConfig = {
  type: "partner",
  slug: "home",

  // ── SEO ─────────────────────────────────────────────────────────────────────
  metadata: {
    title: "AcheAqui — Encontre produtos locais perto de você",
    description:
      "Compre de empreendedores locais com entrega rápida, pagamento seguro e os melhores preços da sua região. Apoie o comércio local.",
  },

  // ── Partner block (repurposed as "powered by local entrepreneurs") ──────────
  // This shows as a logo lockup in the hero area
  partner: {
    name: "Empreendedores Locais",
    logo: "/images/placeholder-logo.png",      // replace with real logo later
    logoDark: "/images/placeholder-logo.png",
    description:
      "AcheAqui conecta você com empreendedores locais verificados da sua região.",
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    title: "Encontre produtos locais perto de você",
    subtitle: "Find local products near you",
    description:
      "Compre diretamente de empreendedores da sua cidade. Produtos frescos, artesanais e únicos — entregues com rapidez e segurança. " +
      "Shop directly from entrepreneurs in your city. Fresh, handcrafted, and unique products — delivered quickly and safely.",
    badge: "🛍️ Marketplace Local",
    ctas: [
      {
        label: "Explorar produtos",
        href: "/products",
        variant: "default",
      },
      {
        label: "Seja um empreendedor",
        href: "/register",
        variant: "secondary",
        external: false,
      },
    ],
    // Replace with a real hero image later
    image: {
      src: "/images/landing-pages/home/hero.png",
      alt: "Produtos locais AcheAqui",
    },
  },

  // ── Big quote (repurposed as featured entrepreneur testimonial) ──────────────
  bigQuote: {
    quote:
      "O AcheAqui transformou meu pequeno negócio. Hoje vendo para toda a cidade e tenho clientes fiéis que descobriram meus produtos pela plataforma.",
    author: "Maria Silva",
    role: "Empreendedora local",
    company: "Doces da Mari",
    // Replace with real avatar later
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "AcheAqui logo",
  },

  // ── Value proposition (why buy on AcheAqui) ─────────────────────────────────
  valueProposition: {
    title: "Por que comprar no AcheAqui?",
    items: [
      {
        icon: "heart",
        title: "Apoie o comércio local",
        description:
          "Cada compra fortalece empreendedores da sua cidade. Support local businesses — every purchase makes a difference.",
      },
      {
        icon: "truck",
        title: "Entrega rápida e segura",
        description:
          "Receba seus produtos com rapidez e rastreamento em tempo real. Fast and tracked delivery right to your door.",
      },
      {
        icon: "shield",
        title: "Pagamento 100% seguro",
        description:
          "Pix, cartão de crédito ou boleto — tudo protegido e criptografado. Pix, credit card or boleto — all encrypted and secure.",
      },
    ],
  },

  // ── Content blocks (featured categories) ────────────────────────────────────
  // These will be replaced with dynamic data from GET /inventory/category later
  contentBlocks: [
    {
      title: "Explore por categoria",
      subtitle: "Browse by category",
      items: [
        {
          icon: "shopping-bag",
          title: "Artesanato",
          description:
            "Peças únicas feitas à mão por artesãos locais. Unique handcrafted pieces from local artisans.",
        },
        {
          icon: "utensils",
          title: "Gastronomia",
          description:
            "Produtos frescos, geleias, doces e muito mais. Fresh products, jams, sweets and more.",
        },
        {
          icon: "leaf",
          title: "Orgânicos",
          description:
            "Hortifruti orgânico direto do produtor. Organic fruits and vegetables straight from the producer.",
        },
        {
          icon: "shirt",
          title: "Moda local",
          description:
            "Roupas e acessórios de designers independentes. Clothes and accessories from independent designers.",
        },
        {
          icon: "home",
          title: "Casa e decoração",
          description:
            "Itens únicos para deixar sua casa com a sua cara. Unique items to make your home your own.",
        },
        {
          icon: "gift",
          title: "Presentes",
          description:
            "Presentes especiais para momentos únicos. Special gifts for unique moments.",
        },
      ],
      columns: 3,
      variant: "cards",
    },
  ],

  // ── Social proof (stats + reviews) ──────────────────────────────────────────
  // Stats are placeholders — replace with real numbers later
  // Testimonials will come from GET /analytics/reviews later
  socialProof: {
    stats: [
      { value: "500+", label: "Empreendedores cadastrados" },
      { value: "10K+", label: "Produtos disponíveis" },
      { value: "4.8★", label: "Avaliação média" },
    ],
    testimonials: [
      {
        quote:
          "Encontrei produtos que não achava em nenhuma outra loja. A qualidade é incrível e a entrega foi super rápida!",
        author: "João Pereira",
        role: "Cliente",
        company: "Florianópolis, SC",
      },
      {
        quote:
          "Adoro comprar no AcheAqui. Sei que estou apoiando negócios locais e ainda recebo produtos únicos.",
        author: "Ana Costa",
        role: "Cliente",
        company: "Florianópolis, SC",
      },
      {
        quote:
          "Minha experiência foi incrível do início ao fim. Recomendo para todo mundo que quer apoiar o comércio local.",
        author: "Carlos Mendes",
        role: "Cliente",
        company: "Florianópolis, SC",
      },
    ],
  },

  // ── Offer (become an entrepreneur CTA) ──────────────────────────────────────
  offer: {
    title: "Quer vender no AcheAqui?",
    description:
      "Cadastre seu negócio gratuitamente e comece a vender para milhares de clientes na sua região. " +
      "Register your business for free and start selling to thousands of customers in your area.",
    cta: {
      label: "Cadastrar meu negócio",
      href: "/register",
      variant: "default",
    },
  },

  // ── Form (newsletter signup) ─────────────────────────────────────────────────
  // Simple email capture — no HubSpot needed for now
  form: {
    title: "Fique por dentro das novidades",
    subtitle: "Stay updated — be the first to know about new products and offers",
    fields: [
      {
        name: "email",
        label: "Seu e-mail",
        type: "email",
        placeholder: "voce@email.com",
        required: true,
      },
      {
        name: "city",
        label: "Sua cidade",
        type: "text",
        placeholder: "Florianópolis",
        required: false,
      },
      {
        name: "interest",
        label: "O que você quer encontrar?",
        type: "select",
        required: false,
        options: [
          { label: "Artesanato", value: "artesanato" },
          { label: "Gastronomia", value: "gastronomia" },
          { label: "Orgânicos", value: "organicos" },
          { label: "Moda local", value: "moda" },
          { label: "Casa e decoração", value: "casa" },
          { label: "Presentes", value: "presentes" },
        ],
      },
    ],
    submitLabel: "Quero receber novidades",
    gdprText:
      "Ao se cadastrar, você concorda com nossa Política de Privacidade. Você pode cancelar a qualquer momento. " +
      "By signing up, you agree to our Privacy Policy. You can unsubscribe at any time.",
  },
};