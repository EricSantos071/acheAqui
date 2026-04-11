"use client";

import { useEffect, useState } from "react";
import { PageHeader, FooterMinimal, ContentWrapper } from "@/components/layout";
import { cn } from "@/lib/utils";
import type { LegalPageConfig, TOCItem, LegalSection } from "@/types/page-config";

interface LegalTemplateProps {
  config: LegalPageConfig;
}

export function LegalTemplate({ config }: LegalTemplateProps) {
  const { title, effectiveDate, preamble, toc, sections } = config;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1 py-12 sm:py-16">
        <ContentWrapper narrow>
          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
              {title}
            </h1>
            {effectiveDate && (
              <p className="text-muted-foreground">
                Effective date: {effectiveDate}
              </p>
            )}
            {preamble && (
              <p className="mt-6 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {preamble}
              </p>
            )}
          </header>

          <div className={cn(toc && toc.length > 0 && "lg:grid lg:grid-cols-[240px_1fr] lg:gap-12")}>
            {toc && toc.length > 0 && <TableOfContents items={toc} />}

            <article className="prose max-w-none">
              {sections.map((section) => (
                <LegalSectionComponent key={section.id} section={section} />
              ))}
            </article>
          </div>
        </ContentWrapper>
      </main>

      <FooterMinimal />
    </div>
  );
}

function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -80% 0px",
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav
      className="hidden lg:block sticky top-24 self-start"
      aria-label="Table of contents"
    >
      <h2 className="text-sm font-medium text-foreground mb-4">
        On this page
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                "block text-sm py-1 transition-colors",
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// dangerouslySetInnerHTML is safe: content is developer-authored in config
// files, imported at build time, never from user input.
function LegalSectionComponent({ section }: { section: LegalSection }) {
  return (
    <section id={section.id} className="scroll-mt-24">
      <h2>{section.title}</h2>
      {typeof section.content === "string" ? (
        <div dangerouslySetInnerHTML={{ __html: section.content }} />
      ) : (
        section.content
      )}
    </section>
  );
}
