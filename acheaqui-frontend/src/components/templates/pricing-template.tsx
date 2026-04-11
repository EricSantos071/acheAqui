import { Check, X } from "lucide-react";
import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { FAQSection, SocialProof, FormSection, CountdownTimer } from "@/components/blocks";
import { CTAButton } from "@/components/ui/cta-button";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PricingPageConfig, PricingTier } from "@/types/page-config";

interface PricingTemplateProps {
  config: PricingPageConfig;
}

export function PricingTemplate({ config }: PricingTemplateProps) {
  const { slug, hero, tiers, featureComparison, urgency, faq, socialProof, form } = config;

  const gridCols =
    tiers.length === 1
      ? "max-w-md mx-auto"
      : tiers.length === 2
        ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
        : "grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto";

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Hero */}
        <Section className="py-16 sm:py-24 text-center">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto">
              {hero.badge && (
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                  {hero.badge}
                </span>
              )}

              {urgency?.message && (
                <p className="text-sm font-medium text-destructive mb-4">
                  {urgency.message}
                </p>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-6">
                {hero.title}
              </h1>

              {hero.subtitle && (
                <p className="text-xl text-muted-foreground mb-4">
                  {hero.subtitle}
                </p>
              )}

              {hero.description && (
                <div className="text-lg text-muted-foreground mb-8">
                  {typeof hero.description === "string" ? (
                    <p>{hero.description}</p>
                  ) : (
                    hero.description
                  )}
                </div>
              )}

              {urgency?.targetDate && (
                <CountdownTimer
                  targetDate={urgency.targetDate}
                  label={urgency.label}
                />
              )}
            </div>
          </ContentWrapper>
        </Section>

        {/* Pricing tiers */}
        <Section className="py-12 sm:py-16">
          <ContentWrapper>
            <div className={cn("grid gap-8", gridCols)}>
              {tiers.map((tier, index) => (
                <TierCard key={index} tier={tier} />
              ))}
            </div>
          </ContentWrapper>
        </Section>

        {/* Feature comparison table */}
        {featureComparison && (
          <Section className="py-12 sm:py-16 bg-card">
            <ContentWrapper>
              {featureComparison.title && (
                <h2 className="text-3xl sm:text-4xl font-medium text-foreground text-center mb-12">
                  {featureComparison.title}
                </h2>
              )}
              <div className="max-w-4xl mx-auto overflow-x-auto">
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground py-4 px-6">
                          Feature
                        </th>
                        {featureComparison.columns.map((col) => (
                          <th
                            key={col}
                            className="text-center text-sm font-medium text-foreground py-4 px-6"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {featureComparison.rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={cn(
                            "border-t border-border",
                            rowIndex % 2 === 1 && "bg-background"
                          )}
                        >
                          <td className="text-sm text-foreground py-4 px-6 font-medium">
                            {row.feature}
                          </td>
                          {row.values.map((value, colIndex) => (
                            <td key={colIndex} className="text-center text-sm py-4 px-6">
                              <ComparisonCellValue value={value} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ContentWrapper>
          </Section>
        )}

        {/* Social proof */}
        {socialProof && <SocialProof config={socialProof} />}

        {/* FAQ */}
        {faq && (
          <FAQSection
            title={faq.title}
            subtitle={faq.subtitle}
            items={faq.items}
          />
        )}

        {/* Form */}
        {form && (
          <div className="py-16 md:py-24">
            <FormSection
              config={form}
              formName={`${slug}-form`}
              pageSlug={slug}
              pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
            />
          </div>
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}

/** A single pricing tier card. */
function TierCard({ tier }: { tier: PricingTier }) {
  const currency = tier.currency || "$";
  const period = tier.period || "/mo";
  const savingsPercent = Math.round(
    ((tier.originalPrice - tier.salePrice) / tier.originalPrice) * 100
  );

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border border-border bg-card p-8",
        tier.highlighted && "ring-2 ring-primary scale-[1.02]"
      )}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default" className="px-3 py-1 text-xs">
            {tier.badge}
          </Badge>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-medium text-foreground mb-1">{tier.name}</h3>
        {tier.description && (
          <p className="text-sm text-muted-foreground">{tier.description}</p>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-lg text-muted-foreground line-through">
            {currency}{tier.originalPrice}
          </span>
          <Badge variant="secondary" className="text-xs">
            Save {savingsPercent}%
          </Badge>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-4xl font-medium text-foreground">
            {currency}{tier.salePrice}
          </span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check size={16} strokeWidth={2} className="text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <CTAButton
        cta={tier.cta}
        size="large"
        defaultVariant={tier.highlighted ? "default" : "outline"}
      />
    </div>
  );
}

/** Renders a boolean or string value inside the feature comparison table. */
function ComparisonCellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">
        <Check size={14} strokeWidth={3} className="text-primary" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/50">
        <X size={14} strokeWidth={2} className="text-muted-foreground" />
      </span>
    );
  }

  return <span className="text-sm text-muted-foreground">{value}</span>;
}

