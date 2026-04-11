import Link from "next/link";
import {
  PageHeader,
  FooterMinimal,
  ContentWrapper,
  Section,
} from "@/components/layout";

interface TemplateExample {
  title: string;
  description: string;
  slug: string;
}

const templateExamples: TemplateExample[] = [
  {
    title: "Lead Generation",
    description: "Ebook downloads, webinar signups, demo requests with forms and social proof.",
    slug: "example-ebook",
  },
  {
    title: "Thank You",
    description: "Confirmation pages after form submissions with CTAs and next steps.",
    slug: "example-ebook/thank-you",
  },
  {
    title: "Legal / Rules",
    description: "Terms, privacy policies, sweepstakes rules with table of contents.",
    slug: "example-rules",
  },
  {
    title: "Waitlist",
    description: "Coming soon pages with countdown timer and email capture.",
    slug: "example-waitlist",
  },
  {
    title: "Resource Hub",
    description: "Content libraries with filtering, featured resources, and newsletter signup.",
    slug: "example-resources",
  },
  {
    title: "Partner Co-marketing",
    description: "Joint promotions with partner logos, value props, and special offers.",
    slug: "example-partner",
  },
  {
    title: "Comparison",
    description: "Product comparisons with feature tables, split sections, timelines, and FAQs.",
    slug: "example-comparison",
  },
  {
    title: "Pricing",
    description: "Sale pricing pages with tier cards, feature comparison, countdown urgency, and FAQ.",
    slug: "example-pricing",
  },
  {
    title: "Webinar",
    description: "Event registration pages with speaker bios, agenda timeline, and signup forms.",
    slug: "example-webinar",
  },
  {
    title: "Case Study",
    description: "Customer stories with problem/solution/results narrative, metrics, and quotes.",
    slug: "example-case-study",
  },
  {
    title: "Product Launch",
    description: "Announcement pages with feature highlights, video, code snippets, and FAQs.",
    slug: "example-product-launch",
  },
  {
    title: "Demo Request",
    description: "Book a demo pages with prominent form, value props, and social proof.",
    slug: "example-demo-request",
  },
  {
    title: "Job Listing",
    description: "Job postings with role details, requirements, benefits, and application form.",
    slug: "example-job-listing",
  },
  {
    title: "Event Recap",
    description: "Post-event pages with recording, speakers, slides, and related resources.",
    slug: "example-event-recap",
  },
  {
    title: "Integration",
    description: "Integration pages with logo lockup, setup steps, code examples, and features.",
    slug: "example-integration",
  },
];

/**
 * Home page - displays all available landing page templates
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <Section className="py-16">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-medium text-foreground mb-4">
                Landing Page Templates
              </h1>
              <p className="text-lg text-muted-foreground">
                Data-driven campaign pages for lead generation, promotions, and partner marketing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {templateExamples.map((example) => (
                <Link
                  key={example.slug}
                  href={`/${example.slug}`}
                  className="group block p-6 rounded-lg border border-border bg-background hover:bg-card hover:border-border transition-colors"
                >
                  <h2 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                    {example.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {example.description}
                  </p>
                  <span className="text-sm text-primary group-hover:underline">
                    /{example.slug}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-16 max-w-2xl mx-auto">
              <h2 className="text-xl font-medium text-foreground mb-4 text-center">
                Create your own
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  1. Copy an example from{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
                    data/pages/examples/
                  </code>{" "}
                  into{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
                    data/pages/
                  </code>
                </p>
                <p>
                  2. Update the slug, content, and form configuration
                </p>
                <p>
                  3. Register it in{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
                    data/pages/index.ts
                  </code>
                </p>
                <p>
                  4. Your page is live at{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
                    /your-slug
                  </code>
                </p>
              </div>
            </div>
          </ContentWrapper>
        </Section>
      </main>

      <FooterMinimal />
    </div>
  );
}
