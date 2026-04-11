import Image from "next/image";
import Link from "next/link";
import { ContentWrapper, Section } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { QuoteConfig } from "@/types/page-config";

function resolveAvatarUrl(avatar: string, size = 96): string {
  const ghProfileMatch = avatar.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_-]+?)(?:\.png)?$/
  );
  if (ghProfileMatch) {
    return `https://github.com/${ghProfileMatch[1]}.png?size=${size}`;
  }

  return avatar;
}

export type QuoteProps = QuoteConfig & {
  size?: "default" | "large";
  className?: string;
};

function MaybeLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  if (href) {
    return (
      <Link className="hover:opacity-90 transition-opacity" href={href}>
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

export function Quote({
  quote,
  author,
  role,
  avatar,
  logo,
  logoDark,
  logoAlt,
  link,
  size = "default",
  className,
}: QuoteProps) {
  const resolvedAvatar = avatar ? resolveAvatarUrl(avatar) : undefined;

  if (size === "large") {
    return (
      <Section className={cn("py-16 md:py-24", className)}>
        <ContentWrapper className="flex flex-col items-center text-center gap-8 md:gap-16">
          <q className="text-2xl max-w-xs md:text-2xl xl:text-4xl md:max-w-screen-lg w-full text-muted-foreground">
            {quote}
          </q>
          <MaybeLink href={link}>
            <div className="flex flex-col items-center gap-10 group w-full">
              <div className="flex flex-col gap-6 items-center">
                {resolvedAvatar && (
                  <figure className="text-muted-foreground rounded-full overflow-hidden relative w-12 h-12">
                    <Image
                      src={resolvedAvatar}
                      alt={author}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                )}

                <div className="flex flex-col items-center gap-y-1">
                  <span className="text-foreground">{author}</span>
                  <span className="text-muted-foreground font-mono text-sm">
                    {role}
                  </span>
                </div>
              </div>

              {logo && (
                <figure className="mb-4 max-w-24 md:max-w-32">
                  {logoDark ? (
                    <>
                      <Image
                        src={logo}
                        alt={logoAlt || "Company logo"}
                        width={128}
                        height={48}
                        className="h-8 w-auto object-contain opacity-60 dark:hidden"
                      />
                      <Image
                        src={logoDark}
                        alt={logoAlt || "Company logo"}
                        width={128}
                        height={48}
                        className="h-8 w-auto object-contain opacity-60 hidden dark:block"
                      />
                    </>
                  ) : (
                    <Image
                      src={logo}
                      alt={logoAlt || "Company logo"}
                      width={128}
                      height={48}
                      className="h-8 w-auto object-contain opacity-60 dark:invert"
                    />
                  )}
                </figure>
              )}
            </div>
          </MaybeLink>
        </ContentWrapper>
      </Section>
    );
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg p-px bg-gradient-to-b from-border to-border/50 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="relative h-full w-full rounded-[7px] bg-background p-5 flex flex-col justify-between text-muted-foreground">
        <div className="flex flex-col justify-between gap-6">
          <q className="text-base">{quote}</q>
        </div>

        <MaybeLink href={link}>
          <div className="flex flex-row gap-3 w-full items-center mt-6">
            {resolvedAvatar && (
              <Image
                src={resolvedAvatar}
                alt={author}
                width={32}
                height={32}
                className="rounded-full bg-muted border border-border flex-shrink-0"
              />
            )}
            <div className="flex flex-col gap-0">
              <span className="text-base text-muted-foreground leading-snug">
                {author}
              </span>
              {role && (
                <span className="uppercase font-mono text-sm text-muted-foreground leading-tight">
                  {role}
                </span>
              )}
            </div>
          </div>
        </MaybeLink>
      </div>
    </div>
  );
}
