import type { ReactNode } from "react";

// Form field configuration
export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "checkbox";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// CTA button configuration
export interface CTAConfig {
  label: string;
  href: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
  external?: boolean;
}

// Hero section configuration
export interface HeroConfig {
  title: string;
  subtitle?: string;
  description?: string | ReactNode;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  ctas?: CTAConfig[];
}

// Content block for features, benefits, etc.
export interface ContentBlockItem {
  icon?: string | ReactNode;
  title: string;
  description: string | ReactNode;
}

export interface ContentBlockConfig {
  title?: string;
  subtitle?: string;
  items: ContentBlockItem[];
  columns?: 2 | 3;
  variant?: "default" | "cards" | "icons";
}

// Social proof configuration
export interface TestimonialConfig {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

export interface LogoConfig {
  name: string;
  src: string;
  srcDark?: string;
  href?: string;
}

export interface StatConfig {
  value: string;
  label: string;
}

export interface SocialProofConfig {
  logos?: LogoConfig[];
  testimonials?: TestimonialConfig[];
  stats?: StatConfig[];
}

// Customer.io event configuration
export interface CustomerIOEventConfig {
  eventName: string;
  metadata?: Record<string, string | number | boolean>;
}

// Form section configuration
export interface FormConfig {
  title?: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  submitLabel?: string;
  hubspotFormId?: string;
  hubspotPortalId?: string;
  successRedirect?: string;
  gdprText?: string | ReactNode;
  customerio?: CustomerIOEventConfig;
}

// Legal page TOC item
export interface TOCItem {
  id: string;
  label: string;
}

// Legal content section
export interface LegalSection {
  id: string;
  title: string;
  content: string | ReactNode;
}

// Base page metadata
export interface PageMetadata {
  title: string;
  description: string;
  ogImage?: string;
  noIndex?: boolean;
}

// Video embed configuration
export interface VideoConfig {
  url: string;
  title?: string;
  subtitle?: string;
}

// Lead generation page configuration
export interface LeadGenPageConfig {
  type: "lead-gen";
  slug: string;
  metadata: PageMetadata;
  hero: HeroConfig;
  video?: VideoConfig;
  contentBlocks?: ContentBlockConfig[];
  socialProof?: SocialProofConfig;
  form: FormConfig;
}

// Thank you page configuration
export interface ThankYouPageConfig {
  type: "thank-you";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
  };
  cta?: CTAConfig;
  secondaryContent?: {
    title?: string;
    description?: string | ReactNode;
    ctas?: CTAConfig[];
  };
}

// Legal page configuration
export interface LegalPageConfig {
  type: "legal";
  slug: string;
  metadata: PageMetadata;
  title: string;
  effectiveDate?: string;
  /** Bold preamble before the table of contents */
  preamble?: string;
  toc?: TOCItem[];
  sections: LegalSection[];
}

// Waitlist page configuration
export interface WaitlistPageConfig {
  type: "waitlist";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
  };
  countdown?: {
    targetDate: string; // ISO date string
    label?: string;
  };
  features?: ContentBlockItem[];
  form: FormConfig;
  socialProof?: SocialProofConfig;
}

// Resource item for resource hub
export interface ResourceItem {
  title: string;
  description: string;
  type: "ebook" | "whitepaper" | "guide" | "webinar" | "video" | "case-study" | "template";
  image?: {
    src: string;
    alt: string;
  };
  href: string;
  videoUrl?: string;
  tags?: string[];
  featured?: boolean;
}

// Code snippet configuration
export interface CodeSnippetConfig {
  code: string;
  language: "typescript" | "ts" | "javascript" | "js" | "bash" | "sql" | "json" | "python" | "py";
  filename?: string;
  showLineNumbers?: boolean;
  title?: string;
  subtitle?: string;
}

// Resource hub page configuration
export interface ResourceHubPageConfig {
  type: "resource-hub";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
  };
  featuredResources?: ResourceItem[];
  resources: ResourceItem[];
  categories?: Array<{
    id: string;
    label: string;
  }>;
  codeSnippet?: CodeSnippetConfig;
  newsletterCta?: {
    title: string;
    description?: string;
    form: FormConfig;
  };
}

export interface QuoteConfig {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  logo?: string;
  logoDark?: string;
  logoAlt?: string;
  link?: string;
}

export interface PartnerLogoConfig {
  name: string;
  src: string;
  srcDark?: string;
  href?: string;
}

export interface PartnerPageConfig {
  type: "partner";
  slug: string;
  metadata: PageMetadata;
  partner: {
    name: string;
    logo: string;
    logoDark?: string;
    description?: string;
  };
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
    image?: {
      src: string;
      alt: string;
    };
  };
  valueProposition?: {
    title?: string;
    items: ContentBlockItem[];
  };
  bigQuote?: QuoteConfig;
  contentBlocks?: ContentBlockConfig[];
  socialProof?: SocialProofConfig;
  offer?: {
    title: string;
    description: string | ReactNode;
    cta?: CTAConfig;
    expiryDate?: string;
  };
  form?: FormConfig;
}

export interface LogoCloudItemConfig {
  name: string;
  src: string;
  srcDark?: string;
  href?: string;
}

export interface FAQItemConfig {
  question: string;
  answer: string | ReactNode;
}

export interface ComparisonColumnConfig {
  name: string;
  highlight?: boolean;
}

export interface ComparisonRowConfig {
  feature: string;
  values: Array<string | boolean>;
}

export interface TimelineStepConfig {
  title: string;
  description: string;
  icon?: string;
}

export interface SplitSectionConfig {
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  cta?: CTAConfig;
  reversed?: boolean;
}

export interface ComparisonPageConfig {
  type: "comparison";
  slug: string;
  metadata: PageMetadata;
  hero: HeroConfig;
  logoCloud?: {
    title?: string;
    logos: LogoCloudItemConfig[];
  };
  comparisonTable?: {
    title?: string;
    subtitle?: string;
    columns: ComparisonColumnConfig[];
    rows: ComparisonRowConfig[];
  };
  splitSections?: SplitSectionConfig[];
  timeline?: {
    title?: string;
    subtitle?: string;
    steps: TimelineStepConfig[];
  };
  faq?: {
    title?: string;
    subtitle?: string;
    items: FAQItemConfig[];
  };
  contentBlocks?: ContentBlockConfig[];
  socialProof?: SocialProofConfig;
  ctaBanner?: {
    title: string;
    description?: string;
    cta: CTAConfig;
    secondaryCta?: CTAConfig;
  };
  form?: FormConfig;
}

// Pricing tier configuration
export interface PricingTier {
  name: string;
  description?: string;
  originalPrice: number;
  salePrice: number;
  currency?: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  cta: CTAConfig;
  badge?: string;
}

// Pricing / sale price page configuration
export interface PricingPageConfig {
  type: "pricing";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
  };
  tiers: PricingTier[];
  featureComparison?: {
    title?: string;
    columns: string[];
    rows: { feature: string; values: (string | boolean)[] }[];
  };
  urgency?: {
    targetDate?: string;
    label?: string;
    message?: string;
  };
  faq?: {
    title?: string;
    subtitle?: string;
    items: FAQItemConfig[];
  };
  socialProof?: SocialProofConfig;
  form?: FormConfig;
}

// Speaker configuration for webinar pages
export interface SpeakerConfig {
  name: string;
  role: string;
  company?: string;
  bio?: string;
  avatar?: { src: string; alt: string };
}

// Agenda item for webinar pages
export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

// Case study page configuration
export interface CaseStudyPageConfig {
  type: "case-study";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
    customerLogo?: { src: string; srcDark?: string; alt: string };
  };
  customer: {
    name: string;
    industry?: string;
    size?: string;
    location?: string;
  };
  challenge: {
    title?: string;
    description: string | ReactNode;
  };
  solution: {
    title?: string;
    description: string | ReactNode;
    features?: ContentBlockItem[];
  };
  results: {
    title?: string;
    description?: string | ReactNode;
    metrics: StatConfig[];
  };
  customerQuote?: QuoteConfig;
  splitSections?: SplitSectionConfig[];
  ctaBanner: {
    title: string;
    description?: string;
    cta: CTAConfig;
    secondaryCta?: CTAConfig;
  };
}

// Product launch / announcement page configuration
export interface ProductLaunchPageConfig {
  type: "product-launch";
  slug: string;
  metadata: PageMetadata;
  hero: HeroConfig;
  badge?: string;
  video?: VideoConfig;
  features?: ContentBlockConfig[];
  splitSections?: SplitSectionConfig[];
  codeSnippet?: CodeSnippetConfig;
  socialProof?: SocialProofConfig;
  faq?: {
    title?: string;
    subtitle?: string;
    items: FAQItemConfig[];
  };
  ctaBanner: {
    title: string;
    description?: string;
    cta: CTAConfig;
    secondaryCta?: CTAConfig;
  };
  form?: FormConfig;
}

// Demo request / book a meeting page configuration
export interface DemoRequestPageConfig {
  type: "demo-request";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
  };
  form: FormConfig;
  calendarEmbed?: {
    url: string;
    title?: string;
  };
  valueProps?: ContentBlockItem[];
  socialProof?: SocialProofConfig;
  customerQuote?: QuoteConfig;
  faq?: {
    title?: string;
    subtitle?: string;
    items: FAQItemConfig[];
  };
  ctaBanner?: {
    title: string;
    description?: string;
    cta: CTAConfig;
    secondaryCta?: CTAConfig;
  };
}

// Job listing page configuration
export interface JobListingPageConfig {
  type: "job-listing";
  slug: string;
  metadata: PageMetadata;
  role: {
    title: string;
    department?: string;
    location: string;
    type?: string;
    salary?: string;
  };
  description: string | ReactNode;
  responsibilities?: {
    title?: string;
    items: string[];
  };
  requirements?: {
    title?: string;
    items: string[];
  };
  niceToHave?: {
    title?: string;
    items: string[];
  };
  benefits?: ContentBlockItem[];
  aboutSection?: {
    title?: string;
    description: string | ReactNode;
    image?: { src: string; alt: string };
  };
  form: FormConfig;
}

// Event recap page configuration
export interface EventRecapPageConfig {
  type: "event-recap";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
  };
  event: {
    date: string;
    location?: string;
    attendees?: string;
  };
  recording?: VideoConfig;
  speakers?: SpeakerConfig[];
  keyTakeaways?: ContentBlockItem[];
  slides?: {
    title?: string;
    description?: string;
    downloadUrl: string;
    previewImage?: { src: string; alt: string };
  };
  socialProof?: SocialProofConfig;
  relatedResources?: Array<{
    title: string;
    description: string;
    href: string;
    type?: string;
  }>;
  ctaBanner?: {
    title: string;
    description?: string;
    cta: CTAConfig;
    secondaryCta?: CTAConfig;
  };
  form?: FormConfig;
}

// Integration page configuration
export interface IntegrationPageConfig {
  type: "integration";
  slug: string;
  metadata: PageMetadata;
  hero: HeroConfig;
  integration: {
    name: string;
    logo: string;
    logoDark?: string;
    description?: string;
    category?: string;
  };
  setupSteps?: {
    title?: string;
    subtitle?: string;
    steps: TimelineStepConfig[];
  };
  features?: ContentBlockConfig[];
  codeSnippet?: CodeSnippetConfig;
  splitSections?: SplitSectionConfig[];
  socialProof?: SocialProofConfig;
  faq?: {
    title?: string;
    subtitle?: string;
    items: FAQItemConfig[];
  };
  ctaBanner: {
    title: string;
    description?: string;
    cta: CTAConfig;
    secondaryCta?: CTAConfig;
  };
}

// Webinar page configuration
export interface WebinarPageConfig {
  type: "webinar";
  slug: string;
  metadata: PageMetadata;
  hero: {
    title: string;
    subtitle?: string;
    description?: string | ReactNode;
    badge?: string;
  };
  webinar: {
    date: string;
    startTime: string;
    duration: string;
    url: string;
  };
  speakers?: SpeakerConfig[];
  agenda?: AgendaItem[];
  contentBlocks?: ContentBlockConfig[];
  socialProof?: SocialProofConfig;
  form: FormConfig;
}

export type PageConfig =
  | LeadGenPageConfig
  | ThankYouPageConfig
  | LegalPageConfig
  | WaitlistPageConfig
  | ResourceHubPageConfig
  | PartnerPageConfig
  | ComparisonPageConfig
  | PricingPageConfig
  | WebinarPageConfig
  | CaseStudyPageConfig
  | ProductLaunchPageConfig
  | DemoRequestPageConfig
  | JobListingPageConfig
  | EventRecapPageConfig
  | IntegrationPageConfig;

export function isLeadGenPage(config: PageConfig): config is LeadGenPageConfig {
  return config.type === "lead-gen";
}

export function isThankYouPage(
  config: PageConfig
): config is ThankYouPageConfig {
  return config.type === "thank-you";
}

export function isLegalPage(config: PageConfig): config is LegalPageConfig {
  return config.type === "legal";
}

export function isWaitlistPage(config: PageConfig): config is WaitlistPageConfig {
  return config.type === "waitlist";
}

export function isResourceHubPage(config: PageConfig): config is ResourceHubPageConfig {
  return config.type === "resource-hub";
}

export function isPartnerPage(config: PageConfig): config is PartnerPageConfig {
  return config.type === "partner";
}

export function isComparisonPage(config: PageConfig): config is ComparisonPageConfig {
  return config.type === "comparison";
}

export function isPricingPage(config: PageConfig): config is PricingPageConfig {
  return config.type === "pricing";
}

export function isWebinarPage(config: PageConfig): config is WebinarPageConfig {
  return config.type === "webinar";
}

export function isCaseStudyPage(config: PageConfig): config is CaseStudyPageConfig {
  return config.type === "case-study";
}

export function isProductLaunchPage(config: PageConfig): config is ProductLaunchPageConfig {
  return config.type === "product-launch";
}

export function isDemoRequestPage(config: PageConfig): config is DemoRequestPageConfig {
  return config.type === "demo-request";
}

export function isJobListingPage(config: PageConfig): config is JobListingPageConfig {
  return config.type === "job-listing";
}

export function isEventRecapPage(config: PageConfig): config is EventRecapPageConfig {
  return config.type === "event-recap";
}

export function isIntegrationPage(config: PageConfig): config is IntegrationPageConfig {
  return config.type === "integration";
}
