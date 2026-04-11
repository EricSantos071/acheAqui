import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { TimelineStepConfig } from "@/types/page-config";

export type TimelineStep = TimelineStepConfig;

interface TimelineSectionProps {
  title?: string;
  subtitle?: string;
  steps: TimelineStep[];
  className?: string;
}

export function TimelineSection({
  title,
  subtitle,
  steps,
  className,
}: TimelineSectionProps) {
  return (
    <Section className={cn("py-16 md:py-24", className)}>
      <ContentWrapper>
        {(title || subtitle) && (
          <div className="text-center mb-16 md:mb-24">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-border hidden sm:block" />

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex gap-6 sm:gap-8 group"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-background border border-border group-hover:border-primary/50 flex items-center justify-center transition-colors">
                    <span className="text-sm font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">
                      {step.icon ?? String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="flex-1 pb-8 pt-1">
                  <div className="rounded-lg border border-border bg-background p-6 group-hover:border-border transition-colors">
                    <h3 className="text-base font-medium text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}
