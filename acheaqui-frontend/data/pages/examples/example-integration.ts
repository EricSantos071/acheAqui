import type { IntegrationPageConfig } from "@/types/page-config";

export const exampleIntegrationPage: IntegrationPageConfig = {
  type: "integration",
  slug: "example-integration",
  metadata: {
    title: "DataFlow Platform + Stripe Integration",
    description:
      "Connect DataFlow Platform with Stripe to accept payments, sync transactions, and automate revenue workflows in minutes.",
  },
  hero: {
    title: "DataFlow Platform + Stripe",
    subtitle: "Accept payments in minutes",
    description:
      "Connect your DataFlow Platform account with Stripe to process payments, sync transaction data in real time, and unlock powerful revenue analytics. No custom code required for basic setups, and fully extensible when you need it.",
    ctas: [
      {
        label: "Get started",
        href: "#",
        variant: "default",
      },
      {
        label: "Read the docs",
        href: "#",
        variant: "secondary",
        external: true,
      },
    ],
  },
  integration: {
    name: "Stripe",
    logo: "/images/logos/stripe.png",
    description:
      "Stripe is the leading payments infrastructure platform for internet businesses.",
    category: "Payments",
  },
  setupSteps: {
    title: "Get started in three steps",
    subtitle: "Go from zero to accepting payments in under five minutes.",
    steps: [
      {
        title: "Install the SDK",
        description:
          "Add the DataFlow Stripe package to your project with a single command. Works with npm, yarn, and pnpm.",
        icon: "download",
      },
      {
        title: "Configure your API keys",
        description:
          "Add your Stripe publishable and secret keys to your DataFlow environment. Keys are encrypted at rest and never logged.",
        icon: "key",
      },
      {
        title: "Start accepting payments",
        description:
          "Use our prebuilt checkout components or call the payment API directly. Transactions sync to your DataFlow dashboard automatically.",
        icon: "check-circle",
      },
    ],
  },
  features: [
    {
      title: "What you get with the Stripe integration",
      subtitle: "Everything you need to manage payments at scale.",
      columns: 3,
      variant: "icons",
      items: [
        {
          icon: "refresh-cw",
          title: "Automatic syncing",
          description:
            "Every charge, refund, and dispute syncs to DataFlow in real time. No batch jobs, no stale data.",
        },
        {
          icon: "bar-chart",
          title: "Revenue analytics",
          description:
            "See MRR, churn, LTV, and cohort metrics out of the box. Combine payment data with product usage for deeper insights.",
        },
        {
          icon: "webhook",
          title: "Webhook management",
          description:
            "DataFlow handles Stripe webhook verification, retry logic, and deduplication so you can focus on your business logic.",
        },
      ],
    },
  ],
  codeSnippet: {
    title: "Simple by default, flexible when you need it",
    subtitle:
      "A few lines of TypeScript are all it takes to create a payment intent and start collecting revenue.",
    language: "typescript",
    filename: "create-payment.ts",
    showLineNumbers: true,
    code: `import { DataFlow } from "@dataflow/sdk";
import { StripePlugin } from "@dataflow/stripe";

const df = new DataFlow({
  apiKey: process.env.DATAFLOW_API_KEY,
  plugins: [new StripePlugin({ secretKey: process.env.STRIPE_SECRET_KEY })],
});

const payment = await df.stripe.paymentIntents.create({
  amount: 2000,
  currency: "usd",
  metadata: { orderId: "order_123" },
});

console.log(payment.clientSecret);`,
  },
  socialProof: {
    stats: [
      { value: "10K+", label: "Active integrations" },
      { value: "99.99%", label: "Payment uptime" },
      { value: "50+", label: "Supported payment methods" },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    subtitle: "Common questions about the DataFlow + Stripe integration.",
    items: [
      {
        question: "Does the Stripe integration cost extra?",
        answer:
          "No. The Stripe integration is included in all DataFlow plans at no additional charge. You only pay Stripe's standard processing fees on transactions.",
      },
      {
        question: "Which currencies are supported?",
        answer:
          "The integration supports every currency that Stripe supports, which currently includes 135+ currencies. Currency conversion and multi-currency reporting are handled automatically.",
      },
      {
        question: "How does DataFlow handle PCI compliance?",
        answer:
          "DataFlow never stores or transmits raw card numbers. All sensitive payment data is handled directly by Stripe through their PCI DSS Level 1 certified infrastructure. Your DataFlow account only stores tokenized references and transaction metadata.",
      },
    ],
  },
  ctaBanner: {
    title: "Ready to accept payments?",
    description:
      "Connect Stripe to DataFlow in minutes and start processing payments today.",
    cta: {
      label: "Get started free",
      href: "#",
      variant: "default",
    },
    secondaryCta: {
      label: "Talk to sales",
      href: "#",
      variant: "outline",
    },
  },
};
