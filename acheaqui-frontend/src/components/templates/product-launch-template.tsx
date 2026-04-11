import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import {
  ContentBlock,
  SocialProof,
  FormSection,
  VideoSection,
  FAQSection,
  CTABanner,
  SplitSection,
} from "@/components/blocks";
import { CodeSection } from "@/components/blocks/code-snippet";
import { CTAButton } from "@/components/ui/cta-button";
import type { ProductLaunchPageConfig } from "@/types/page-config";

interface ProductLaunchTemplateProps {
  config: ProductLaunchPageConfig;
}

export function ProductLaunchTemplate({ config }: ProductLaunchTemplateProps) {
  const {
    slug,
    hero,
    badge,
    video,
    features,
    splitSections,
    codeSnippet,
    socialProof,
    faq,
    ctaBanner,
    form,
  } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Hero section with optional badge */}
        <Section className="py-16 sm:py-24 text-center">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto">
              {badge && (
                <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                  {badge}
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

              {hero.ctas && hero.ctas.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {hero.ctas.map((cta, index) => (
                    <CTAButton
                      key={index}
                      cta={cta}
                      size="large"
                      defaultVariant={index === 0 ? "default" : "secondary"}
                    />
                  ))}
                </div>
              )}
            </div>
          </ContentWrapper>
        </Section>

        {/* Video */}
        {video && (
          <VideoSection
            url={video.url}
            title={video.title}
            subtitle={video.subtitle}
            className="py-12 sm:py-16"
          />
        )}

        {/* Feature content blocks */}
        {features?.map((block, index) => (
          <ContentBlock key={index} config={block} />
        ))}

        {/* Split sections */}
        {splitSections?.map((section, index) => (
          <SplitSection
            key={index}
            title={section.title}
            description={section.description}
            image={section.image}
            cta={section.cta}
            reversed={section.reversed ?? index % 2 === 1}
            className={index % 2 === 1 ? "bg-card" : undefined}
          />
        ))}

        {/* Code snippet */}
        {codeSnippet && (
          <CodeSection
            code={codeSnippet.code}
            language={codeSnippet.language}
            filename={codeSnippet.filename}
            title={codeSnippet.title}
            subtitle={codeSnippet.subtitle}
            showLineNumbers={codeSnippet.showLineNumbers}
            className="py-12 sm:py-16"
          />
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

        {/* CTA banner */}
        <CTABanner
          title={ctaBanner.title}
          description={ctaBanner.description}
          cta={ctaBanner.cta}
          secondaryCta={ctaBanner.secondaryCta}
        />

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
