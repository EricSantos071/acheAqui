import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiLoginPage: PartnerPageConfig = {
  type: "partner",
  slug: "login",

  metadata: {
    title: "AcheAqui — Login",
    description: "Entre na sua conta para comprar ou gerenciar seu negócio.",
  },

  partner: {
    name: "AcheAqui",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    description: "Acesse sua conta.",
  },

  hero: {
    title: "Bem-vindo de volta",
    subtitle: "Welcome back",
    description: "Faça login para continuar sua jornada no marketplace local.",
    badge: "Acesso Seguro",
    ctas: [
      { label: "Entrar", href: "#", variant: "default" },
    ],
    image: {
      src: "/images/landing-pages/login/hero.png",
      alt: "Login illustration",
    },
  },

  // Required sections for the type check
  bigQuote: {
    quote: "A tecnologia deve facilitar o encontro entre quem faz e quem precisa.",
    author: "Equipe AcheAqui",
    role: "Suporte",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Sua conta, suas escolhas",
    items: [
      { icon: "user", title: "Cliente", description: "Acompanhe seus pedidos e favoritos." },
      { icon: "briefcase", title: "Empreendedor", description: "Gerencie seus produtos e vendas." },
    ],
  },

  contentBlocks: [],
  socialProof: { stats: [], testimonials: [] },
  offer: {
    title: "Ainda não tem conta?",
    description: "Cadastre-se agora em poucos segundos.",
    cta: { label: "Criar Conta", href: "/register", variant: "secondary" },
  },
  form: {
    title: "Login",
    fields: [
      { name: "email", label: "E-mail", type: "email", required: true },
      { name: "password", label: "Senha", type: "password", required: true },
    ],
    submitLabel: "Entrar",
  },
};