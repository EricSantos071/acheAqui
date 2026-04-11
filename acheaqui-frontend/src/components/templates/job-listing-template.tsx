import Image from "next/image";

import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";
import { ContentBlock, FormSection } from "@/components/blocks";
import { Icon } from "@/components/ui/icon";
import type { JobListingPageConfig, ContentBlockConfig } from "@/types/page-config";

interface JobListingTemplateProps {
  config: JobListingPageConfig;
}

export function JobListingTemplate({ config }: JobListingTemplateProps) {
  const {
    slug,
    role,
    description,
    responsibilities,
    requirements,
    niceToHave,
    benefits,
    aboutSection,
    form,
  } = config;

  const benefitsBlockConfig: ContentBlockConfig | null = benefits
    ? {
        title: "Benefits",
        items: benefits,
        columns: 3,
        variant: "cards",
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        {/* Role header */}
        <RoleHeader role={role} />

        {/* Description */}
        <Section className="py-12 sm:py-16 bg-card">
          <ContentWrapper>
            <div className="max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed">
              {typeof description === "string" ? (
                <p>{description}</p>
              ) : (
                description
              )}
            </div>
          </ContentWrapper>
        </Section>

        {/* Responsibilities */}
        {responsibilities && (
          <Section className="py-12 sm:py-16">
            <ContentWrapper>
              <BulletList
                title={responsibilities.title || "What you will do"}
                items={responsibilities.items}
              />
            </ContentWrapper>
          </Section>
        )}

        {/* Requirements */}
        {requirements && (
          <Section className="py-12 sm:py-16 bg-card">
            <ContentWrapper>
              <BulletList
                title={requirements.title || "What we are looking for"}
                items={requirements.items}
              />
            </ContentWrapper>
          </Section>
        )}

        {/* Nice to have */}
        {niceToHave && (
          <Section className="py-12 sm:py-16">
            <ContentWrapper>
              <BulletList
                title={niceToHave.title || "Nice to have"}
                items={niceToHave.items}
              />
            </ContentWrapper>
          </Section>
        )}

        {/* Benefits */}
        {benefitsBlockConfig && (
          <ContentBlock
            config={benefitsBlockConfig}
            className={niceToHave ? "py-12 sm:py-16 bg-card" : "py-12 sm:py-16"}
          />
        )}

        {/* About section */}
        {aboutSection && (
          <Section
            className={
              benefitsBlockConfig
                ? niceToHave
                  ? "py-12 sm:py-16"
                  : "py-12 sm:py-16 bg-card"
                : niceToHave
                  ? "py-12 sm:py-16 bg-card"
                  : "py-12 sm:py-16"
            }
          >
            <ContentWrapper>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
                    {aboutSection.title || "About us"}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed text-lg">
                    {typeof aboutSection.description === "string" ? (
                      <p>{aboutSection.description}</p>
                    ) : (
                      aboutSection.description
                    )}
                  </div>
                </div>
                {aboutSection.image && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={aboutSection.image.src}
                      alt={aboutSection.image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </ContentWrapper>
          </Section>
        )}

        {/* Application form */}
        <FormSection
          config={form}
          formName={slug}
          pageSlug={slug}
          pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
          className="py-12 sm:py-16"
        />
      </main>

      <FooterMinimal />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface RoleHeaderProps {
  role: JobListingPageConfig["role"];
}

function RoleHeader({ role }: RoleHeaderProps) {
  const pills = [
    role.department ? { icon: "building-2", label: role.department } : null,
    { icon: "map-pin", label: role.location },
    role.type ? { icon: "clock", label: role.type } : null,
    role.salary ? { icon: "banknote", label: role.salary } : null,
  ].filter(Boolean) as Array<{ icon: string; label: string }>;

  return (
    <Section className="py-16 sm:py-24 text-center">
      <ContentWrapper>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-8">
            {role.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            {pills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground border border-border"
              >
                <Icon name={pill.icon} size={16} />
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}

interface BulletListProps {
  title: string;
  items: string[];
}

function BulletList({ title, items }: BulletListProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-6">
        {title}
      </h2>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-muted-foreground text-lg"
          >
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
