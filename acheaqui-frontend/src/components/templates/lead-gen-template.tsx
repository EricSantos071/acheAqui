import { PageHeader, FooterMinimal } from "@/components/layout";
import { HeroSection, ContentBlock, SocialProof, FormSection, VideoSection } from "@/components/blocks";
import type { LeadGenPageConfig } from "@/types/page-config";

interface LeadGenTemplateProps {
  config: LeadGenPageConfig;
}

export function LeadGenTemplate({ config }: LeadGenTemplateProps) {
  const { slug, hero, video, contentBlocks, socialProof, form } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <HeroSection config={hero} />

        {video && (
          <VideoSection
            url={video.url}
            title={video.title}
            subtitle={video.subtitle}
          />
        )}

        {contentBlocks?.map((block, index) => (
          <ContentBlock key={index} config={block} />
        ))}

        {socialProof && <SocialProof config={socialProof} />}

        <FormSection
          config={form}
          formName={slug}
          pageSlug={slug}
          pageUrl={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${slug}`}
        />
      </main>

      <FooterMinimal />
    </div>
  );
}
