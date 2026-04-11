import Image from "next/image";
import { ContentWrapper, Section } from "@/components/layout";
import { Quote } from "@/components/blocks/quote";
import { Stats } from "@/components/blocks/stats";
import { cn } from "@/lib/utils";
import type { SocialProofConfig } from "@/types/page-config";

interface SocialProofProps {
  config: SocialProofConfig;
  className?: string;
}

export function SocialProof({ config, className }: SocialProofProps) {
  const { logos, testimonials, stats } = config;
  const hasContent = logos?.length || testimonials?.length || stats?.length;

  if (!hasContent) return null;

  return (
    <Section className={cn("py-12 sm:py-16", className)}>
      <ContentWrapper>
        {logos && logos.length > 0 && (
          <div className="mb-12">
            <p className="text-sm text-muted-foreground text-center mb-8">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {logos.map((logo) => (
                <div
                  key={logo.name}
                  className="relative h-8 w-auto opacity-60 hover:opacity-100 transition-opacity"
                >
                  {logo.href ? (
                    <a
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={logo.name}
                    >
                      {logo.srcDark ? (
                        <>
                          <Image
                            src={logo.src}
                            alt={logo.name}
                            width={120}
                            height={32}
                            className="h-8 w-auto object-contain dark:hidden"
                          />
                          <Image
                            src={logo.srcDark}
                            alt={logo.name}
                            width={120}
                            height={32}
                            className="h-8 w-auto object-contain hidden dark:block"
                          />
                        </>
                      ) : (
                        <Image
                          src={logo.src}
                          alt={logo.name}
                          width={120}
                          height={32}
                          className="h-8 w-auto object-contain dark:invert"
                        />
                      )}
                    </a>
                  ) : logo.srcDark ? (
                    <>
                      <Image
                        src={logo.src}
                        alt={logo.name}
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain dark:hidden"
                      />
                      <Image
                        src={logo.srcDark}
                        alt={logo.name}
                        width={120}
                        height={32}
                        className="h-8 w-auto object-contain hidden dark:block"
                      />
                    </>
                  ) : (
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={120}
                      height={32}
                      className="h-8 w-auto object-contain dark:invert"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {stats && stats.length > 0 && (
          <Stats stats={stats.map(s => ({ value: s.value, label: s.label }))} className={testimonials?.length ? "mb-12" : ""} />
        )}
        {testimonials && testimonials.length > 0 && (
          <Testimonials testimonials={testimonials} />
        )}
      </ContentWrapper>
    </Section>
  );
}

function Testimonials({
  testimonials,
}: {
  testimonials: NonNullable<SocialProofConfig["testimonials"]>;
}) {
  const gridCols = testimonials.length === 1
    ? "max-w-lg mx-auto"
    : testimonials.length === 2
    ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-4", gridCols)}>
      {testimonials.map((testimonial, index) => (
        <Quote
          key={index}
          quote={testimonial.quote}
          author={testimonial.author}
          role={[testimonial.role, testimonial.company].filter(Boolean).join(", ")}
          avatar={testimonial.avatar}
          size="default"
        />
      ))}
    </div>
  );
}
