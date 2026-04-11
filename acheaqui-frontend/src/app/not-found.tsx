import Link from "next/link";
import { Button } from "@/components/ui";
import { PageHeader, FooterMinimal, ContentWrapper, Section } from "@/components/layout";

/**
 * 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      <main className="flex-1">
        <Section className="py-24">
          <ContentWrapper>
            <div className="max-w-md mx-auto text-center">
              <p className="text-6xl font-medium text-primary mb-4">
                404
              </p>
              <h1 className="text-2xl font-medium text-foreground mb-4">
                Page not found
              </h1>
              <p className="text-muted-foreground mb-8">
                The page you are looking for does not exist or has been moved.
              </p>
              <Button asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </ContentWrapper>
        </Section>
      </main>

      <FooterMinimal />
    </div>
  );
}
