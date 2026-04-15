// data/pages/acheaqui-dashboard.ts
import type { PartnerPageConfig } from "@/types/page-config";

export const acheaquiDashboardPage: PartnerPageConfig = {
  type: "partner",
  slug: "dashboard",

  metadata: {
    title: "Painel do Empreendedor — AcheAqui",
    description: "Gerencie suas vendas e produtos.",
  },

  partner: {
    name: "Doces da Mari",
    logo: "https://github.com/octocat.png",
    description: "Visão Geral do seu Negócio.",
  },

  hero: {
    title: "Olá, Mari!",
    subtitle: "Seu painel está atualizado.",
    description: "Você tem 3 novos pedidos aguardando preparação hoje.",
    badge: "Vendedor Nível 2",
    ctas: [
      { label: "Adicionar Produto", href: "/add-product", variant: "default" },
    ],
    image: {
      src: "/images/ui/dashboard-chart.png",
      alt: "Gráfico de vendas",
    },
  },

  // KPI Metrics for the store owner
  socialProof: {
    stats: [
      { value: "R$ 1.250", label: "Vendas no Mês" },
      { value: "48", label: "Pedidos Totais" },
      { value: "4.9", label: "Avaliação Média" },
    ],
    testimonials: [],
  },

  contentBlocks: [
    {
      title: "Pedidos Pendentes",
      items: [
        { icon: "clock", title: "Pedido #1204", description: "1x Geleia de Morango - Aguardando Coleta" },
        { icon: "clock", title: "Pedido #1205", description: "2x Brownies - Em Preparação" },
      ],
      columns: 1,
      variant: "cards",
    },
  ],

  offer: {
    title: "Dica do Dia",
    description: "Produtos com fotos em luz natural vendem 30% mais. Que tal atualizar suas fotos?",
    cta: { label: "Ver Dicas", href: "/dicas", variant: "secondary" },
  },
};