import Image from "next/image";

import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { Quote, Stats, SplitSection, CTABanner } from "@/components/blocks";
import { Icon } from "@/components/ui/icon";
import type { CaseStudyPageConfig } from "@/types/page-config";

interface CaseStudyTemplateProps {
  config: CaseStudyPageConfig;
}

export function CaseStudyTemplate({ config }: CaseStudyTemplateProps) {
  const {
    hero,
    customer,
    challenge,
    solution,
    results,
    customerQuote,
    splitSections,
    ctaBanner,
  } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Hero section */}
        <Section className="py-16 sm:py-24 text-center">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto">
              {hero.badge && (
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                  {hero.badge}
                </span>
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

              {hero.customerLogo && (
                <div className="flex justify-center mt-8">
                  {hero.customerLogo.srcDark ? (
                    <>
                      <Image
                        src={hero.customerLogo.src}
                        alt={hero.customerLogo.alt}
                        width={160}
                        height={48}
                        className="h-10 w-auto object-contain dark:hidden"
                      />
                      <Image
                        src={hero.customerLogo.srcDark}
                        alt={hero.customerLogo.alt}
                        width={160}
                        height={48}
                        className="h-10 w-auto object-contain hidden dark:block"
                      />
                    </>
                  ) : (
                    <Image
                      src={hero.customerLogo.src}
                      alt={hero.customerLogo.alt}
                      width={160}
                      height={48}
                      className="h-10 w-auto object-contain dark:invert"
                    />
                  )}
                </div>
              )}
            </div>
          </ContentWrapper>
        </Section>

        {/* Customer info bar */}
        <CustomerInfoBar customer={customer} />

        {/* Challenge section */}
        <Section className="py-12 sm:py-16">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
                {challenge.title || "The challenge"}
              </h2>
              <div className="text-muted-foreground leading-relaxed text-lg">
                {typeof challenge.description === "string" ? (
                  <p>{challenge.description}</p>
                ) : (
                  challenge.description
                )}
              </div>
            </div>
          </ContentWrapper>
        </Section>

        {/* Solution section */}
        <Section className="py-12 sm:py-16 bg-card">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
                {solution.title || "The solution"}
              </h2>
              <div className="text-muted-foreground leading-relaxed text-lg mb-10">
                {typeof solution.description === "string" ? (
                  <p>{solution.description}</p>
                ) : (
                  solution.description
                )}
              </div>
            </div>

            {solution.features && solution.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {solution.features.map((feature, index) => (
                  <div key={index} className="text-center">
                    {feature.icon && (
                      <div className="flex justify-center mb-4">
                        {typeof feature.icon === "string" ? (
                          <Icon name={feature.icon} size={32} />
                        ) : (
                          feature.icon
                        )}
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <div className="text-muted-foreground">
                      {typeof feature.description === "string" ? (
                        <p>{feature.description}</p>
                      ) : (
                        feature.description
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentWrapper>
        </Section>

        {/* Results section */}
        <Section className="py-12 sm:py-16">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
                {results.title || "The results"}
              </h2>
              {results.description && (
                <div className="text-muted-foreground leading-relaxed text-lg">
                  {typeof results.description === "string" ? (
                    <p>{results.description}</p>
                  ) : (
                    results.description
                  )}
                </div>
              )}
            </div>
            <Stats stats={results.metrics} className="max-w-4xl mx-auto" />
          </ContentWrapper>
        </Section>

        {/* Customer quote */}
        {customerQuote && (
          <Quote
            quote={customerQuote.quote}
            author={customerQuote.author}
            role={customerQuote.role}
            avatar={customerQuote.avatar}
            logo={customerQuote.logo}
            logoDark={customerQuote.logoDark}
            logoAlt={customerQuote.logoAlt}
            link={customerQuote.link}
            size="large"
          />
        )}

        {/* Split sections */}
        {splitSections?.map((section, index) => (
          <SplitSection key={index} {...section} />
        ))}

        {/* CTA banner */}
        <CTABanner
          title={ctaBanner.title}
          description={ctaBanner.description}
          cta={ctaBanner.cta}
          secondaryCta={ctaBanner.secondaryCta}
        />
      </main>

      <FooterMinimal />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface CustomerInfoBarProps {
  customer: CaseStudyPageConfig["customer"];
}

function CustomerInfoBar({ customer }: CustomerInfoBarProps) {
  const items = [
    { label: "Customer", value: customer.name },
    customer.industry ? { label: "Industry", value: customer.industry } : null,
    customer.size ? { label: "Company size", value: customer.size } : null,
    customer.location ? { label: "Location", value: customer.location } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <Section className="py-6 bg-card border-y border-border">
      <ContentWrapper>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {items.map((item) => (
            <span key={item.label} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{item.label}:</span>{" "}
              {item.value}
            </span>
          ))}
        </div>
      </ContentWrapper>
    </Section>
  );
}
