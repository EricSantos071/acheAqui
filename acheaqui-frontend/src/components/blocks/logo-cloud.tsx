import Image from "next/image";
import Link from "next/link";
import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { LogoCloudItemConfig } from "@/types/page-config";

export type LogoCloudItem = LogoCloudItemConfig;

interface LogoCloudProps {
  title?: string;
  logos: LogoCloudItem[];
  className?: string;
}

export function LogoCloud({ title, logos, className }: LogoCloudProps) {
  return (
    <Section className={cn("py-16", className)}>
      <ContentWrapper>
        <div className="flex flex-col items-center gap-10">
          {title && (
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest text-center">
              {title}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-12 max-w-3xl mx-auto items-center justify-items-center">
          {logos.map((logo) => {
            const image = logo.srcDark ? (
              <>
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className="h-6 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity dark:hidden"
                />
                <Image
                  src={logo.srcDark}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className="h-6 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity hidden dark:block"
                />
              </>
            ) : (
              <Image
                src={logo.src}
                alt={logo.name}
                width={120}
                height={40}
                className="h-6 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity dark:invert"
              />
            );

            if (logo.href) {
              return (
                <Link
                  key={logo.name}
                  href={logo.href}
                  className="flex items-center justify-center"
                  target={logo.href.startsWith("http") ? "_blank" : undefined}
                  rel={logo.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {image}
                </Link>
              );
            }

            return (
              <div key={logo.name} className="flex items-center justify-center">
                {image}
              </div>
            );
          })}
          </div>
        </div>
      </ContentWrapper>
    </Section>
  );
}
