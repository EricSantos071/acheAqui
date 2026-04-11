import Image from "next/image";
import { ContentWrapper } from "@/components/layout";
import { CTAButton } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";
import type { HeroConfig } from "@/types/page-config";

interface HeroSectionProps {
  config: HeroConfig;
  className?: string;
}

export function HeroSection({ config, className }: HeroSectionProps) {
  const { title, subtitle, description, image, ctas } = config;

  return (
    <section className={cn("py-16 lg:py-24", className)}>
      <ContentWrapper>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {subtitle && (
              <p className="text-sm text-primary font-mono uppercase">
                {subtitle}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-4xl 2xl:text-6xl font-medium tracking-[-0.15px] text-foreground">
              {title}
            </h1>
            {description && (
              <div className="text-lg text-muted-foreground max-w-xl">
                {typeof description === "string" ? (
                  <p>{description}</p>
                ) : (
                  description
                )}
              </div>
            )}
            {ctas && ctas.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {ctas.map((cta, index) => (
                  <CTAButton
                    key={index}
                    cta={cta}
                    size="large"
                    defaultVariant={index === 0 ? "default" : "secondary"}
                  />
                ))}
              </div>
            )}
          </div>
          {image && (
            <div className="relative aspect-[4/3] lg:aspect-square">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </ContentWrapper>
    </section>
  );
}
