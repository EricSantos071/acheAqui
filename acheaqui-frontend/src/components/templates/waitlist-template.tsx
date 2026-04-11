import Image from "next/image";
import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { FormSection, Stats, CountdownTimer } from "@/components/blocks";
import { Icon } from "@/components/ui/icon";
import type { WaitlistPageConfig } from "@/types/page-config";

interface WaitlistTemplateProps {
  config: WaitlistPageConfig;
}

export function WaitlistTemplate({ config }: WaitlistTemplateProps) {
  const { slug, hero, countdown, features, form, socialProof } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Hero Section */}
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

              {countdown && (
                <CountdownTimer
                  targetDate={countdown.targetDate}
                  label={countdown.label}
                />
              )}
            </div>
          </ContentWrapper>
        </Section>

        {/* Features Preview */}
        {features && features.length > 0 && (
          <Section className="py-12 sm:py-16 bg-card">
            <ContentWrapper>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
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
            </ContentWrapper>
          </Section>
        )}

        {/* Form Section */}
        <FormSection
          config={form}
          formName={slug}
          pageSlug={slug}
          pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
          className="py-12 sm:py-16"
        />

        {/* Social Proof */}
        {socialProof && (socialProof.stats || socialProof.logos) && (
          <Section className="py-12 sm:py-16 border-t border-border">
            <ContentWrapper>
              {socialProof.stats && socialProof.stats.length > 0 && (
                <Stats
                  stats={socialProof.stats.map(s => ({ value: s.value, label: s.label }))}
                  className="mb-12"
                />
              )}

              {socialProof.logos && socialProof.logos.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                  {socialProof.logos.map((logo, index) => (
                    <Image
                      key={index}
                      src={logo.src}
                      alt={logo.name}
                      width={120}
                      height={32}
                      className="h-8 w-auto object-contain"
                    />
                  ))}
                </div>
              )}
            </ContentWrapper>
          </Section>
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}

