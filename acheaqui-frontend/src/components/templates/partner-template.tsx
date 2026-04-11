import Image from "next/image";
import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { ContentBlock, SocialProof, FormSection, Quote } from "@/components/blocks";
import { CTAButton } from "@/components/ui/cta-button";
import { Icon } from "@/components/ui/icon";
import { SiteLogo } from "@/components/ui/site-logo";
import type { PartnerPageConfig } from "@/types/page-config";

interface PartnerTemplateProps {
  config: PartnerPageConfig;
}

export function PartnerTemplate({ config }: PartnerTemplateProps) {
  const {
    slug,
    partner,
    hero,
    valueProposition,
    bigQuote,
    contentBlocks,
    socialProof,
    offer,
    form,
  } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <Section className="py-8">
          <ContentWrapper>
            <div className="flex items-center justify-center gap-6">
              <SiteLogo className="h-8" />
              <span className="text-2xl text-muted-foreground">+</span>
              {partner.logoDark ? (
                <>
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain dark:hidden"
                  />
                  <Image
                    src={partner.logoDark}
                    alt={partner.name}
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain hidden dark:block"
                  />
                </>
              ) : (
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={120}
                  height={32}
                  className="h-8 w-auto object-contain dark:invert"
                />
              )}
            </div>
          </ContentWrapper>
        </Section>

        <Section className="py-16 lg:py-24 bg-muted border-b border-border">
          <ContentWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                {hero.badge && (
                  <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                    {hero.badge}
                  </span>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-4xl 2xl:text-6xl font-medium tracking-[-0.15px] text-foreground mb-6">
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

                {partner.description && (
                  <p className="text-sm text-muted-foreground italic">
                    {partner.description}
                  </p>
                )}
              </div>

              {hero.image && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={hero.image.src}
                    alt={hero.image.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </ContentWrapper>
        </Section>

        {valueProposition && valueProposition.items.length > 0 && (
          <Section className="py-12 sm:py-16 bg-card">
            <ContentWrapper>
              {valueProposition.title && (
                <h2 className="text-2xl sm:text-3xl font-medium text-foreground text-center mb-12">
                  {valueProposition.title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {valueProposition.items.map((item, index) => (
                  <div key={index} className="text-center">
                    {item.icon && (
                      <div className="flex justify-center mb-4">
                        {typeof item.icon === "string" ? (
                          <Icon name={item.icon} size={32} />
                        ) : (
                          item.icon
                        )}
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {item.title}
                    </h3>
                    <div className="text-muted-foreground">
                      {typeof item.description === "string" ? (
                        <p>{item.description}</p>
                      ) : (
                        item.description
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ContentWrapper>
          </Section>
        )}

        {bigQuote && (
          <Quote
            quote={bigQuote.quote}
            author={bigQuote.author}
            role={bigQuote.role}
            avatar={bigQuote.avatar}
            logo={bigQuote.logo}
            logoAlt={bigQuote.logoAlt}
            link={bigQuote.link}
            size="large"
          />
        )}

        {contentBlocks?.map((block, index) => (
          <ContentBlock key={index} config={block} />
        ))}

        {socialProof && <SocialProof config={socialProof} />}

        {offer && (
          <Section className="py-12 sm:py-16 bg-card border-y border-primary">
            <ContentWrapper>
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-primary text-primary-foreground">
                  Special Offer
                </div>
                <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
                  {offer.title}
                </h2>
                <div className="text-muted-foreground mb-6">
                  {typeof offer.description === "string" ? (
                    <p>{offer.description}</p>
                  ) : (
                    offer.description
                  )}
                </div>
                {offer.expiryDate && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Offer expires: {new Date(offer.expiryDate).toLocaleDateString()}
                  </p>
                )}
                {offer.cta && <CTAButton cta={offer.cta} size="medium" />}
              </div>
            </ContentWrapper>
          </Section>
        )}

        {form && (
          <FormSection
            config={form}
            formName={slug}
            pageSlug={slug}
            pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
            className="py-12 sm:py-16"
          />
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}
