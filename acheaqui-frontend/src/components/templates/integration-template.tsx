import Image from "next/image";
import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import {
  HeroSection,
  ContentBlock,
  SocialProof,
  FAQSection,
  TimelineSection,
  SplitSection,
  CTABanner,
} from "@/components/blocks";
import { CodeSection } from "@/components/blocks/code-snippet";
import { SiteLogo } from "@/components/ui/site-logo";
import type { IntegrationPageConfig } from "@/types/page-config";

interface IntegrationTemplateProps {
  config: IntegrationPageConfig;
}

function LogoLockup({
  integration,
}: {
  integration: IntegrationPageConfig["integration"];
}) {
  return (
    <Section className="py-8">
      <ContentWrapper>
        <div className="flex items-center justify-center gap-6">
          <SiteLogo className="h-8" />
          <span className="text-2xl text-muted-foreground">+</span>
          {integration.logoDark ? (
            <>
              <Image
                src={integration.logo}
                alt={integration.name}
                width={120}
                height={32}
                className="h-8 w-auto object-contain dark:hidden"
              />
              <Image
                src={integration.logoDark}
                alt={integration.name}
                width={120}
                height={32}
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </>
          ) : (
            <Image
              src={integration.logo}
              alt={integration.name}
              width={120}
              height={32}
              className="h-8 w-auto object-contain dark:invert"
            />
          )}
        </div>
      </ContentWrapper>
    </Section>
  );
}

export function IntegrationTemplate({ config }: IntegrationTemplateProps) {
  const {
    hero,
    integration,
    setupSteps,
    features,
    codeSnippet,
    splitSections,
    socialProof,
    faq,
    ctaBanner,
  } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <LogoLockup integration={integration} />

        <HeroSection config={hero} />

        {setupSteps && setupSteps.steps.length > 0 && (
          <Section className="py-12 sm:py-16">
            <ContentWrapper>
              {setupSteps.title && (
                <h2 className="text-3xl sm:text-4xl font-medium text-foreground text-center mb-4">
                  {setupSteps.title}
                </h2>
              )}
              {setupSteps.subtitle && (
                <p className="text-lg text-muted-foreground text-center mb-12">
                  {setupSteps.subtitle}
                </p>
              )}
              <TimelineSection steps={setupSteps.steps} />
            </ContentWrapper>
          </Section>
        )}

        {features?.map((block, index) => (
          <ContentBlock key={index} config={block} />
        ))}

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

        {socialProof && <SocialProof config={socialProof} />}

        {faq && (
          <FAQSection
            title={faq.title}
            subtitle={faq.subtitle}
            items={faq.items}
          />
        )}

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
