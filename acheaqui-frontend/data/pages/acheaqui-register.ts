import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiRegisterPage: PartnerPageConfig = {
  type: "partner",
  slug: "register",

  metadata: {
    title: "AcheAqui — Cadastro",
    description: "Crie sua conta como pessoa física ou empreendedor.",
  },

  partner: {
    name: "AcheAqui",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Crie sua conta.",
  },

  hero: {
    title: "Comece agora",
    subtitle: "Join us today",
    description: "Escolha como você deseja participar do nosso ecossistema.",
    badge: "Novo Registro",
    ctas: [],
    image: {
      src: "/images/landing-pages/register/hero.png",
      alt: "Registration choice",
    },
  },

  bigQuote: {
    quote: "O primeiro passo para o sucesso é estar no lugar certo.",
    author: "Comunidade AcheAqui",
    role: "Membro",
    company: "Marketplace",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Escolha seu perfil",
    items: [
      { icon: "shopping-cart", title: "Quero Comprar", description: "Acesse produtos exclusivos da sua região." },
      { icon: "store", title: "Quero Vender", description: "Transforme seu hobby em um negócio lucrativo." },
    ],
  },

  contentBlocks: [
    {
      title: "Opções de Cadastro",
      items: [
        { icon: "user", title: "Pessoa Física", description: "Para quem busca produtos únicos e locais." },
        { icon: "briefcase", title: "Empreendedor", description: "Para quem quer profissionalizar suas vendas." },
      ],
      columns: 2,
      variant: "cards",
    },
  ],

  socialProof: { stats: [], testimonials: [] },
  offer: {
    title: "Dúvidas sobre o cadastro?",
    description: "Nossa equipe está pronta para te ajudar com o onboarding.",
    cta: { label: "Fale Conosco", href: "/fale-conosco", variant: "default" },
  },
  form: {
    title: "Formulário de Cadastro Inicial",
    fields: [
      { name: "name", label: "Nome Completo", type: "text", required: true },
      { name: "email", label: "E-mail", type: "email", required: true },
      { 
        name: "type", 
        label: "Tipo de Perfil", 
        type: "select", 
        options: [
          { label: "Cliente (Pessoa)", value: "person" },
          { label: "Empreendedor (Loja)", value: "entrepreneur" }
        ],
        required: true 
      },
    ],
    submitLabel: "Continuar Cadastro",
  },
};