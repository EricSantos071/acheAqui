import Link from "next/link";
import { SiteLogo } from "@/components/ui/site-logo";
import { ThemeToggle } from "@/components/theme";
import { siteConfig } from "@/config/site";

export function PageHeader() {
  return (
    <header className="w-full py-6">
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="inline-block" aria-label="Home">
            <SiteLogo />
          </Link>
          {siteConfig.nav.length > 0 && (
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-6">
                {siteConfig.nav.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
