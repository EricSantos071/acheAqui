import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { CTAButton } from "@/components/ui/cta-button";
import type { ThankYouPageConfig } from "@/types/page-config";

interface ThankYouTemplateProps {
  config: ThankYouPageConfig;
}

export function ThankYouTemplate({ config }: ThankYouTemplateProps) {
  const { hero, cta, secondaryContent } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <Section className="py-16 sm:py-24">
          <ContentWrapper>
            <div className="max-w-2xl mx-auto text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                <CheckIcon className="w-8 h-8 text-primary" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
                {hero.title}
              </h1>

              {hero.subtitle && (
                <p className="text-xl text-muted-foreground mb-4">
                  {hero.subtitle}
                </p>
              )}

              {hero.description && (
                <div className="text-muted-foreground mb-8">
                  {typeof hero.description === "string" ? (
                    <p>{hero.description}</p>
                  ) : (
                    hero.description
                  )}
                </div>
              )}

              {cta && <CTAButton cta={cta} size="large" />}
            </div>
          </ContentWrapper>
        </Section>

        {secondaryContent && (
          <Section className="bg-muted/50 py-12 sm:py-16">
            <ContentWrapper>
              <div className="max-w-2xl mx-auto text-center">
                {secondaryContent.title && (
                  <h2 className="text-2xl font-medium text-foreground mb-4">
                    {secondaryContent.title}
                  </h2>
                )}
                {secondaryContent.description && (
                  <div className="text-muted-foreground mb-6">
                    {typeof secondaryContent.description === "string" ? (
                      <p>{secondaryContent.description}</p>
                    ) : (
                      secondaryContent.description
                    )}
                  </div>
                )}
                {secondaryContent.ctas && secondaryContent.ctas.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {secondaryContent.ctas.map((cta, index) => (
                      <CTAButton
                        key={index}
                        cta={cta}
                        size="large"
                        defaultVariant={index === 0 ? "default" : "outline"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ContentWrapper>
          </Section>
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
