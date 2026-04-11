import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getPageBySlug,
  getAllPageSlugs,
} from "../../../data/pages";
import {
  LeadGenTemplate,
  ThankYouTemplate,
  LegalTemplate,
  WaitlistTemplate,
  ResourceHubTemplate,
  PartnerTemplate,
  ComparisonTemplate,
  PricingTemplate,
  WebinarTemplate,
  CaseStudyTemplate,
  ProductLaunchTemplate,
  DemoRequestTemplate,
  JobListingTemplate,
  EventRecapTemplate,
  IntegrationTemplate,
} from "@/components/templates";
import {
  isLeadGenPage,
  isThankYouPage,
  isLegalPage,
  isWaitlistPage,
  isResourceHubPage,
  isPartnerPage,
  isComparisonPage,
  isPricingPage,
  isWebinarPage,
  isCaseStudyPage,
  isProductLaunchPage,
  isDemoRequestPage,
  isJobListingPage,
  isEventRecapPage,
  isIntegrationPage,
} from "@/types/page-config";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Generate static params for all known pages
 */
export async function generateStaticParams() {
  const slugs = getAllPageSlugs();
  return slugs.map((slug) => ({
    slug: slug.split("/"),
  }));
}

/**
 * Generate metadata for each page
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join("/");
  const config = getPageBySlug(slug);

  if (!config) {
    return {
      title: "Page Not Found",
    };
  }

  const { metadata } = config;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: `${siteUrl}/${slug}`,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      images: metadata.ogImage ? [metadata.ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: metadata.ogImage ? [metadata.ogImage] : undefined,
    },
    robots: metadata.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Dynamic page component that renders the appropriate template
 */
export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join("/");
  const config = getPageBySlug(slug);

  if (!config) {
    notFound();
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageRenderer config={config} />
    </Suspense>
  );
}

/**
 * Render the appropriate template based on page type
 */
function PageRenderer({
  config,
}: {
  config: ReturnType<typeof getPageBySlug>;
}) {
  if (!config) return null;

  if (isLeadGenPage(config)) {
    return <LeadGenTemplate config={config} />;
  }

  if (isThankYouPage(config)) {
    return <ThankYouTemplate config={config} />;
  }

  if (isLegalPage(config)) {
    return <LegalTemplate config={config} />;
  }

  if (isWaitlistPage(config)) {
    return <WaitlistTemplate config={config} />;
  }

  if (isResourceHubPage(config)) {
    return <ResourceHubTemplate config={config} />;
  }

  if (isPartnerPage(config)) {
    return <PartnerTemplate config={config} />;
  }

  if (isComparisonPage(config)) {
    return <ComparisonTemplate config={config} />;
  }

  if (isPricingPage(config)) {
    return <PricingTemplate config={config} />;
  }

  if (isWebinarPage(config)) {
    return <WebinarTemplate config={config} />;
  }

  if (isCaseStudyPage(config)) {
    return <CaseStudyTemplate config={config} />;
  }

  if (isProductLaunchPage(config)) {
    return <ProductLaunchTemplate config={config} />;
  }

  if (isDemoRequestPage(config)) {
    return <DemoRequestTemplate config={config} />;
  }

  if (isJobListingPage(config)) {
    return <JobListingTemplate config={config} />;
  }

  if (isEventRecapPage(config)) {
    return <EventRecapTemplate config={config} />;
  }

  if (isIntegrationPage(config)) {
    return <IntegrationTemplate config={config} />;
  }

  // This should never happen with proper type guards
  return notFound();
}

/**
 * Loading skeleton
 */
function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <div className="h-20 bg-muted" />
      <div className="flex-1 py-12">
        <div className="max-w-site mx-auto px-4">
          <div className="h-12 w-3/4 bg-muted rounded mb-4" />
          <div className="h-6 w-1/2 bg-muted rounded mb-8" />
          <div className="grid gap-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
