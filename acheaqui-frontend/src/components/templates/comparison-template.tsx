import { PageHeader, FooterMinimal } from "@/components/layout";
import {
  HeroSection,
  LogoCloud,
  ComparisonTable,
  SplitSection,
  TimelineSection,
  ContentBlock,
  SocialProof,
  FAQSection,
  CTABanner,
  FormSection,
} from "@/components/blocks";
import type { ComparisonPageConfig } from "@/types/page-config";

interface ComparisonTemplateProps {
  config: ComparisonPageConfig;
}

export function ComparisonTemplate({ config }: ComparisonTemplateProps) {
  const {
    slug,
    hero,
    logoCloud,
    comparisonTable,
    splitSections,
    timeline,
    contentBlocks,
    socialProof,
    faq,
    ctaBanner,
    form,
  } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <HeroSection config={hero} />

        {logoCloud && (
          <LogoCloud
            title={logoCloud.title}
            logos={logoCloud.logos}
            className="border-b border-border"
          />
        )}

        {comparisonTable && (
          <ComparisonTable
            title={comparisonTable.title}
            subtitle={comparisonTable.subtitle}
            columns={comparisonTable.columns}
            rows={comparisonTable.rows}
          />
        )}

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

        {contentBlocks?.map((block, index) => (
          <ContentBlock key={index} config={block} />
        ))}

        {timeline && (
          <TimelineSection
            title={timeline.title}
            subtitle={timeline.subtitle}
            steps={timeline.steps}
            className="bg-card"
          />
        )}

        {socialProof && <SocialProof config={socialProof} />}

        {faq && (
          <FAQSection
            title={faq.title}
            subtitle={faq.subtitle}
            items={faq.items}
          />
        )}

        {ctaBanner && (
          <CTABanner
            title={ctaBanner.title}
            description={ctaBanner.description}
            cta={ctaBanner.cta}
            secondaryCta={ctaBanner.secondaryCta}
          />
        )}

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
