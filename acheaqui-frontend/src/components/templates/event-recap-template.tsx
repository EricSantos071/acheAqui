import Image from "next/image";
import Link from "next/link";

import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { SocialProof, FormSection, VideoSection, CTABanner, SpeakersGrid } from "@/components/blocks";
import { Icon } from "@/components/ui/icon";
import type { EventRecapPageConfig } from "@/types/page-config";

interface EventRecapTemplateProps {
  config: EventRecapPageConfig;
}

export function EventRecapTemplate({ config }: EventRecapTemplateProps) {
  const {
    slug,
    hero,
    event,
    recording,
    speakers,
    keyTakeaways,
    slides,
    socialProof,
    relatedResources,
    ctaBanner,
    form,
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

              <EventMeta
                date={event.date}
                location={event.location}
                attendees={event.attendees}
              />
            </div>
          </ContentWrapper>
        </Section>

        {/* Recording */}
        {recording && (
          <VideoSection
            url={recording.url}
            title={recording.title}
            subtitle={recording.subtitle}
            className="py-12 sm:py-16 bg-card"
          />
        )}

        {/* Speakers */}
        {speakers && speakers.length > 0 && (
          <Section className="py-12 sm:py-16">
            <ContentWrapper>
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground text-center mb-12">
                Speakers
              </h2>
              <SpeakersGrid speakers={speakers} />
            </ContentWrapper>
          </Section>
        )}

        {/* Key takeaways */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <Section className="py-12 sm:py-16 bg-card">
            <ContentWrapper>
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground text-center mb-12">
                Key takeaways
              </h2>
              <KeyTakeawaysGrid items={keyTakeaways} />
            </ContentWrapper>
          </Section>
        )}

        {/* Slide download */}
        {slides && (
          <Section className="py-12 sm:py-16">
            <ContentWrapper>
              <SlideDownload
                title={slides.title}
                description={slides.description}
                downloadUrl={slides.downloadUrl}
                previewImage={slides.previewImage}
              />
            </ContentWrapper>
          </Section>
        )}

        {/* Social proof */}
        {socialProof && <SocialProof config={socialProof} />}

        {/* Related resources */}
        {relatedResources && relatedResources.length > 0 && (
          <Section className="py-12 sm:py-16">
            <ContentWrapper>
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground text-center mb-12">
                Related resources
              </h2>
              <RelatedResourcesList resources={relatedResources} />
            </ContentWrapper>
          </Section>
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

        {/* Form */}
        {form && (
          <FormSection
            config={form}
            formName={slug}
            pageSlug={slug}
            pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
          />
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface EventMetaProps {
  date: string;
  location?: string;
  attendees?: string;
}

function EventMeta({ date, location, attendees }: EventMetaProps) {
  return (
    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="font-medium text-foreground">Date:</span> {date}
      </span>
      {location && (
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">Location:</span> {location}
        </span>
      )}
      {attendees && (
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">Attendees:</span> {attendees}
        </span>
      )}
    </div>
  );
}

interface KeyTakeawaysGridProps {
  items: EventRecapPageConfig["keyTakeaways"] & object;
}

function KeyTakeawaysGrid({ items }: KeyTakeawaysGridProps) {
  const gridCols = items.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-8 ${gridCols}`}>
      {items.map((item) => (
        <div key={item.title} className="p-6 rounded-md border border-border bg-background">
          {typeof item.icon === "string" && (
            <div className="mb-4">
              <Icon name={item.icon} size={28} />
            </div>
          )}
          {typeof item.icon !== "string" && item.icon && (
            <div className="mb-4">{item.icon}</div>
          )}
          <h3 className="text-lg font-medium text-foreground mb-2">{item.title}</h3>
          <div className="text-sm text-muted-foreground">
            {typeof item.description === "string" ? (
              <p>{item.description}</p>
            ) : (
              item.description
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface SlideDownloadProps {
  title?: string;
  description?: string;
  downloadUrl: string;
  previewImage?: { src: string; alt: string };
}

function SlideDownload({ title, description, downloadUrl, previewImage }: SlideDownloadProps) {
  return (
    <div className="max-w-2xl mx-auto rounded-md border border-border bg-card p-8">
      {previewImage && (
        <div className="relative aspect-video w-full rounded-md overflow-hidden border border-border mb-6">
          <Image
            src={previewImage.src}
            alt={previewImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      )}
      {title && (
        <h3 className="text-xl font-medium text-foreground mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      <Link
        href={downloadUrl}
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        download
      >
        Download slides
      </Link>
    </div>
  );
}

interface RelatedResourcesListProps {
  resources: NonNullable<EventRecapPageConfig["relatedResources"]>;
}

function RelatedResourcesList({ resources }: RelatedResourcesListProps) {
  const gridCols =
    resources.length <= 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-8 ${gridCols}`}>
      {resources.map((resource) => (
        <Link
          key={resource.title}
          href={resource.href}
          className="group block p-6 rounded-md border border-border bg-card hover:border-primary/50 transition-colors"
        >
          {resource.type && (
            <span className="inline-block px-2.5 py-0.5 mb-3 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              {resource.type}
            </span>
          )}
          <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-muted-foreground">{resource.description}</p>
        </Link>
      ))}
    </div>
  );
}
