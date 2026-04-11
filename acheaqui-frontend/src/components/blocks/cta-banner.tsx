import { ContentWrapper, Section } from "@/components/layout";
import { CTAButton } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";
import type { CTAConfig } from "@/types/page-config";

export interface CTABannerProps {
  title: string;
  description?: string;
  cta: CTAConfig;
  secondaryCta?: CTAConfig;
  className?: string;
}

export function CTABanner({
  title,
  description,
  cta,
  secondaryCta,
  className,
}: CTABannerProps) {
  return (
    <Section className={cn("py-16 md:py-24 bg-muted", className)}>
      <ContentWrapper>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CTAButton cta={cta} size="medium" defaultVariant="default" />
            {secondaryCta && (
              <CTAButton cta={secondaryCta} size="medium" defaultVariant="outline" />
            )}
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}
