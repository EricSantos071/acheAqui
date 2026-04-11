"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { FormSection, VideoEmbed, CodeSection } from "@/components/blocks";
import type { ResourceHubPageConfig, ResourceItem } from "@/types/page-config";

interface ResourceHubTemplateProps {
  config: ResourceHubPageConfig;
}

const resourceTypeLabels: Record<ResourceItem["type"], string> = {
  ebook: "Ebook",
  whitepaper: "Whitepaper",
  guide: "Guide",
  webinar: "Webinar",
  video: "Video",
  "case-study": "Case Study",
  template: "Template",
};

export function ResourceHubTemplate({ config }: ResourceHubTemplateProps) {
  const {
    slug,
    hero,
    featuredResources,
    resources,
    categories,
    codeSnippet,
    newsletterCta,
  } = config;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredResources = activeCategory
    ? resources.filter((r) => r.tags?.includes(activeCategory))
    : resources;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <Section className="py-12 sm:py-16">
          <ContentWrapper>
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
                {hero.title}
              </h1>
              {hero.subtitle && (
                <p className="text-xl text-muted-foreground mb-2">
                  {hero.subtitle}
                </p>
              )}
              {hero.description && (
                <div className="text-muted-foreground">
                  {typeof hero.description === "string" ? (
                    <p>{hero.description}</p>
                  ) : (
                    hero.description
                  )}
                </div>
              )}
            </div>
          </ContentWrapper>
        </Section>

        {/* Featured Resources */}
        {featuredResources && featuredResources.length > 0 && (
          <Section className="py-12 sm:py-16 bg-card">
            <ContentWrapper>
              <h2 className="text-2xl font-medium text-foreground mb-8">
                Featured Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredResources.map((resource, index) => (
                  <ResourceCard key={index} resource={resource} featured />
                ))}
              </div>
            </ContentWrapper>
          </Section>
        )}

        {/* Resource Grid */}
        <Section className="py-12 sm:py-16">
          <ContentWrapper>
            {/* Filter Tabs */}
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <Button
                  variant={activeCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <ResourceCard key={index} resource={resource} />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No resources found for this category.
                </p>
              </div>
            )}
          </ContentWrapper>
        </Section>

        {/* Code Snippet */}
        {codeSnippet && (
          <CodeSection
            code={codeSnippet.code}
            language={codeSnippet.language}
            filename={codeSnippet.filename}
            title={codeSnippet.title}
            subtitle={codeSnippet.subtitle}
            showLineNumbers={codeSnippet.showLineNumbers}
            className="bg-card border-t border-border"
          />
        )}

        {/* Newsletter CTA */}
        {newsletterCta && (
          <Section className="py-12 sm:py-16 bg-card border-t border-border">
            <ContentWrapper>
              <div className="max-w-2xl mx-auto">
                <div className="text-center">
                  <h2 className="text-2xl font-medium text-foreground mb-2">
                    {newsletterCta.title}
                  </h2>
                  {newsletterCta.description && (
                    <p className="text-muted-foreground mb-8">
                      {newsletterCta.description}
                    </p>
                  )}
                </div>
                <FormSection
                  config={newsletterCta.form}
                  formName={`${slug}-newsletter`}
                  pageSlug={slug}
                  pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
                />
              </div>
            </ContentWrapper>
          </Section>
        )}
      </main>

      <FooterMinimal />
    </div>
  );
}

interface ResourceCardProps {
  resource: ResourceItem;
  featured?: boolean;
}

function ResourceCard({ resource, featured }: ResourceCardProps) {
  const typeLabel = resourceTypeLabels[resource.type];
  const isVideo = resource.type === "video" && resource.videoUrl;

  const cardContent = (
    <>
      {isVideo ? (
        <VideoEmbed
          url={resource.videoUrl!}
          title={resource.title}
          className="rounded-none border-0"
        />
      ) : resource.image ? (
        <div className="aspect-video relative overflow-hidden bg-muted">
          <Image
            src={resource.image.src}
            alt={resource.image.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
            {typeLabel}
          </span>
          {featured && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary text-primary-foreground">
              Featured
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {resource.description}
        </p>
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {resource.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // Video resources render inline -- no link wrapper needed
  if (isVideo) {
    return (
      <div
        className={`group rounded-lg border border-border bg-background overflow-hidden ${
          featured ? "ring-2 ring-primary" : ""
        }`}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={resource.href}
      className={`group block rounded-lg border border-border bg-background hover:bg-card transition-colors overflow-hidden ${
        featured ? "ring-2 ring-primary" : ""
      }`}
    >
      {cardContent}
    </Link>
  );
}
