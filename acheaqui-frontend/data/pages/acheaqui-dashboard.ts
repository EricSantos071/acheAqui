import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiDashboardPage: PartnerPageConfig = {
  type: "partner",
  slug: "dashboard",

  metadata: {
    title: "Painel do Empreendedor — AcheAqui",
    description: "Gerencie suas vendas, produtos e acompanhe seu crescimento.",
  },

  partner: {
    name: "Doces da Mari",
    logo: "https://github.com/octocat.png", // Entrepreneur's avatar
    logoDark: "https://github.com/octocat.png",
    description: "Vendedor Nível 2 • Membro desde Jan 2026",
  },

  hero: {
    title: "Boas-vindas, Mari!",
    subtitle: "Visão Geral do seu Negócio",
    description: "Seu desempenho está 15% acima da média regional este mês. Continue assim!",
    badge: "Dashboard Ativo",
    ctas: [
      { label: "Novo Produto", href: "/admin/produtos/novo", variant: "default" },
      { label: "Ver Minha Loja", href: "/loja-exemplo", variant: "secondary" },
    ],
    image: {
      src: "/images/ui/dashboard-preview.png",
      alt: "Interface de gráficos e métricas",
    },
  },

  // ── KPI Metrics (The "Scorecard") ──────────────────────────────────────────
  socialProof: {
    stats: [
      { value: "R$ 1.250", label: "Vendas (30 dias)" },
      { value: "48", label: "Pedidos Concluídos" },
      { value: "4.9", label: "Avaliação Média" },
      { value: "12min", label: "Tempo de Resposta" },
    ],
    testimonials: [],
  },

  // ── Operational Task List ──────────────────────────────────────────────────
  contentBlocks: [
    {
      title: "Pedidos Pendentes",
      subtitle: "Ações necessárias para hoje",
      items: [
        { icon: "clock", title: "Pedido #1204", description: "1x Geleia de Morango — Aguardando Coleta" },
        { icon: "package", title: "Pedido #1205", description: "2x Brownies — Em Preparação" },
        { icon: "alert-circle", title: "Pedido #1206", description: "1x Bolo de Rolo — Pagamento Pendente" },
      ],
      columns: 1,
      variant: "cards",
    },
  ],

  bigQuote: {
    quote: "A análise de dados é a bússola que impede o empreendedor de caminhar no escuro.",
    author: "Equipe de Sucesso",
    role: "Consultoria",
    company: "AcheAqui",
    avatar: "https://github.com/octocat.png",
    logo: "/images/placeholder-logo.png",
    logoDark: "/images/placeholder-logo.png",
    logoAlt: "Logo",
  },

  valueProposition: {
    title: "Dicas para Vender Mais",
    items: [
      { icon: "camera", title: "Fotos de Qualidade", description: "Produtos com fundo limpo convertem 40% mais." },
      { icon: "trending-up", title: "Promoções", description: "Ofereça frete grátis no primeiro pedido do cliente." },
    ],
  },

  offer: {
    title: "Relatório Mensal Disponível",
    description: "Baixe o PDF detalhado com o comportamento dos seus clientes.",
    cta: { label: "Baixar Relatório", href: "#", variant: "default" },
  },
};