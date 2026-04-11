import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { FAQItemConfig } from "@/types/page-config";

export type FAQItem = FAQItemConfig;

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQSection({ title, subtitle, items, className }: FAQSectionProps) {
  return (
    <Section className={cn("py-16 md:py-24", className)}>
      <ContentWrapper>
        <div className="max-w-3xl mx-auto">
          {(title || subtitle) && (
            <div className="mb-12">
              {title && (
                <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <div>
            {items.map((item, index) => (
              <details key={index} className="group border-b border-border">
                <summary className="flex w-full cursor-pointer items-center justify-between py-9 text-left list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-medium text-foreground pr-8 group-hover:text-primary transition-colors">
                    {item.question}
                  </span>
                  <svg
                    className="flex-shrink-0 h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="pb-7 text-sm text-muted-foreground leading-relaxed pr-12">
                  {typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}
