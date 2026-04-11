import type { PartnerPageConfig } from "@/types/page-config";

export const examplePartnerPage: PartnerPageConfig = {
  type: "partner",
  slug: "example-partner",
  metadata: {
    title: "ACME Corp + Coyote Solutions - Better Together",
    description:
      "Combine the power of ACME Corp with Coyote Solutions for a seamless, integrated workflow that accelerates your team.",
  },
  partner: {
    name: "Coyote Solutions",
    logo: "/images/logos/vercel.png",
    logoDark: "/images/logos/dark/vercel.png",
    description:
      "Coyote Solutions helps teams move faster with streamlined tooling, reliable infrastructure, and world-class support.",
  },
  hero: {
    title: "Ship faster with ACME Corp + Coyote Solutions",
    subtitle: "The integration your team has been waiting for",
    description:
      "Bring together ACME Corp and Coyote Solutions for a unified workflow that eliminates context switching, reduces setup time, and lets your team focus on building great products.",
    badge: "Official Integration",
    image: {
      src: "/images/landing-pages/example-partner/hero.png",
      alt: "ACME Corp and Coyote Solutions integration",
    },
  },
  bigQuote: {
    quote:
      "This is a sample quote for demonstration purposes. Replace it with a real testimonial from your partner contact.",
    author: "Jane Doe",
    role: "CTO, Example Corp",
    avatar: "https://github.com/octocat.png",
    logo: "/images/logos/vercel.png",
    logoDark: "/images/logos/dark/vercel.png",
    logoAlt: "Coyote Solutions logo",
  },
  valueProposition: {
    title: "Why ACME Corp + Coyote Solutions?",
    items: [
      {
        icon: "zap",
        title: "Faster time to value",
        description:
          "Connect your tools in minutes with a guided setup that gets your team productive from day one.",
      },
      {
        icon: "globe",
        title: "Unified experience",
        description:
          "Work across both platforms without friction. Data flows automatically so your team stays in sync.",
      },
      {
        icon: "shield",
        title: "Secure by default",
        description:
          "Credentials and configuration are managed securely between platforms with built-in encryption and access controls.",
      },
    ],
  },
  contentBlocks: [
    {
      title: "Seamless integration",
      subtitle: "Everything works together out of the box",
      items: [
        {
          icon: "settings",
          title: "One-click setup",
          description:
            "Connect your ACME Corp account to Coyote Solutions with a single click. Configuration is handled automatically.",
        },
        {
          icon: "database",
          title: "Automatic syncing",
          description:
            "Changes in one platform are reflected in the other instantly, keeping your data consistent everywhere.",
        },
        {
          icon: "layers",
          title: "Unified analytics",
          description:
            "Monitor your entire workflow from a single dashboard with combined insights from both platforms.",
        },
      ],
      columns: 3,
      variant: "cards",
    },
  ],
  socialProof: {
    stats: [
      { value: "42", label: "Lightsabers distributed" },
      { value: "12", label: "Parsecs" },
      { value: "99.99%", label: "Fictional uptime" },
    ],
    testimonials: [
      {
        quote:
          "This is a sample testimonial. Replace these with real customer quotes from your partner co-marketing campaign.",
        author: "Darth Vader",
        role: "Sith Lord",
        company: "Galactic Empire",
      },
      {
        quote:
          "Do or do not, there is no try. These are placeholder testimonials for the sample page template.",
        author: "Yoda",
        role: "Grand Master",
        company: "Jedi Council",
      },
      {
        quote:
          "I've made a lot of special modifications myself, but this is just example content for a landing page template.",
        author: "Han Solo",
        role: "Captain",
        company: "Millennium Falcon",
      },
    ],
  },
  offer: {
    title: "Exclusive (fictional) partner offer",
    description:
      "Get a free lightsaber when you sign up for ACME Corp and Coyote Solutions at the same time. This is a sample offer for demonstration purposes only.",
    expiryDate: "2026-12-31",
    cta: {
      label: "Claim Your Lightsaber",
      href: "#form",
      variant: "secondary",
    },
  },
  form: {
    title: "Claim your lightsaber",
    subtitle: "This is a sample form. It does not actually submit anywhere.",
    fields: [
      {
        name: "email",
        label: "Work email",
        type: "email",
        placeholder: "you@company.com",
        required: true,
      },
      {
        name: "company",
        label: "Company",
        type: "text",
        placeholder: "Your company name",
        required: false,
      },
      {
        name: "projectType",
        label: "What are you building?",
        type: "select",
        required: false,
        options: [
          { label: "SaaS application", value: "saas" },
          { label: "E-commerce", value: "ecommerce" },
          { label: "Mobile app backend", value: "mobile" },
          { label: "Internal tools", value: "internal" },
          { label: "Other", value: "other" },
        ],
      },
    ],
    submitLabel: "Claim Lightsaber",
    successRedirect: "/example-partner/thank-you",

    // HubSpot: portal ID and form GUID from your HubSpot account.
    // Field names (email, company, projectType) must match HubSpot internal field names.
    hubspotPortalId: "00000000",
    hubspotFormId: "00000000-0000-0000-0000-000000000000",

    gdprText:
      "This is a sample form. No data is actually collected. Replace this with your real GDPR consent text.",

    // Customer.io: event name and metadata for tracking this form submission.
    customerio: {
      eventName: "partner_signup",
      metadata: {
        partner: "coyote-solutions",
        offer: "3-months-free",
        campaign: "coyote-solutions-integration-2026",
      },
    },
  },
};

export const examplePartnerThankYouPage = {
  type: "thank-you" as const,
  slug: "example-partner/thank-you",
  metadata: {
    title: "Sample Thank You Page",
    description: "This is a sample thank you page for demonstration purposes.",
    noIndex: true,
  },
  hero: {
    title: "Your lightsaber is on the way!",
    subtitle: "This is a sample thank you page",
    description:
      "This is placeholder content for a partner co-marketing thank you page. Replace it with your real confirmation messaging.",
  },
  cta: {
    label: "Go to Dashboard",
    href: "#",
    variant: "default" as const,
    external: true,
  },
  secondaryContent: {
    title: "Get started quickly",
    description:
      "Follow our integration guide to connect ACME Corp and Coyote Solutions.",
    ctas: [
      {
        label: "Integration Guide",
        href: "#",
        variant: "outline" as const,
        external: true,
      },
      {
        label: "Starter Templates",
        href: "#",
        variant: "ghost" as const,
        external: true,
      },
    ],
  },
};
