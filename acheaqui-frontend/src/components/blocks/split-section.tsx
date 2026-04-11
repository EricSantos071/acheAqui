import Image from "next/image";
import { ContentWrapper, Section } from "@/components/layout";
import { CTAButton } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";
import type { SplitSectionConfig } from "@/types/page-config";

export type SplitSectionProps = SplitSectionConfig & {
  className?: string;
};

export function SplitSection({
  title,
  description,
  image,
  cta,
  reversed = false,
  className,
}: SplitSectionProps) {
  return (
    <Section className={cn("py-16 md:py-24", className)}>
      <ContentWrapper>
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center",
            reversed && "lg:[&>*:first-child]:order-2"
          )}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
              {title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {description}
            </p>
            {cta && <CTAButton cta={cta} defaultVariant="outline" />}
          </div>

          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-card">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}
