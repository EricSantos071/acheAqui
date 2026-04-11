import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { SocialProof, FormSection, FAQSection, Quote, CTABanner } from "@/components/blocks";
import { Icon } from "@/components/ui/icon";
import type { DemoRequestPageConfig, ContentBlockItem } from "@/types/page-config";

interface DemoRequestTemplateProps {
  config: DemoRequestPageConfig;
}

export function DemoRequestTemplate({ config }: DemoRequestTemplateProps) {
  const {
    slug,
    hero,
    form,
    calendarEmbed,
    valueProps,
    socialProof,
    customerQuote,
    faq,
    ctaBanner,
  } = config;

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`;
  const hasCalendar = !!calendarEmbed;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Split hero: copy left, form or calendar right */}
        <Section className="py-16 lg:py-24 bg-muted border-b border-border">
          <ContentWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
              </div>

              <div>
                {hasCalendar ? (
                  <CalendarEmbed
                    url={calendarEmbed!.url}
                    title={calendarEmbed!.title}
                  />
                ) : (
                  <FormSection
                    config={form}
                    formName={slug}
                    pageSlug={slug}
                    pageUrl={pageUrl}
                    className="py-0"
                  />
                )}
              </div>
            </div>
          </ContentWrapper>
        </Section>

        {/* Value props grid */}
        {valueProps && valueProps.length > 0 && (
          <ValuePropsGrid items={valueProps} />
        )}

        {/* Social proof */}
        {socialProof && <SocialProof config={socialProof} />}

        {/* Customer quote */}
        {customerQuote && (
          <Quote
            quote={customerQuote.quote}
            author={customerQuote.author}
            role={customerQuote.role}
            avatar={customerQuote.avatar}
            logo={customerQuote.logo}
            logoAlt={customerQuote.logoAlt}
            link={customerQuote.link}
            size="large"
          />
        )}

        {/* FAQ */}
        {faq && (
          <FAQSection
            title={faq.title}
            subtitle={faq.subtitle}
            items={faq.items}
          />
        )}

        {/* Form below the fold when calendar is in the hero */}
        {hasCalendar && (
          <FormSection
            config={form}
            formName={slug}
            pageSlug={slug}
            pageUrl={pageUrl}
            className="py-12 sm:py-16"
          />
        )}

        {/* CTA banner */}
        {ctaBanner && (
          <CTABanner
            title={ctaBanner.title}
            description={ctaBanner.description}
            cta={ctaBanner.cta}
            secondaryCta={ctaBanner.secondaryCta}
          />
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}

function ValuePropsGrid({ items }: { items: ContentBlockItem[] }) {
  const columns = items.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <Section className="py-12 sm:py-16 bg-card">
      <ContentWrapper>
        <div className={`grid grid-cols-1 ${columns} gap-8`}>
          {items.map((item, index) => (
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
  );
}

function CalendarEmbed({ url, title }: { url: string; title?: string }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-background">
      <iframe
        src={url}
        title={title || "Book a meeting"}
        className="w-full"
        style={{ height: "660px", border: "none" }}
      />
    </div>
  );
}
