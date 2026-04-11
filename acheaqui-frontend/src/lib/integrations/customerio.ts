const CUSTOMERIO_SITE_ID = process.env.CUSTOMERIO_SITE_ID;
const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
const CUSTOMERIO_TRACK_URL = "https://track.customer.io/api/v1";

export type CustomerIOResult =
  | { success: true }
  | { success: false; error: string };

export interface CustomerIOProfileData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CustomerIOEventData {
  name: string;
  data: Record<string, unknown>;
  timestamp?: number;
}

export function isCustomerIOConfigured(): boolean {
  return Boolean(CUSTOMERIO_SITE_ID && CUSTOMERIO_API_KEY);
}

function getAuthHeader(): string {
  if (!CUSTOMERIO_SITE_ID || !CUSTOMERIO_API_KEY) {
    throw new Error("Customer.io credentials not configured");
  }
  const credentials = `${CUSTOMERIO_SITE_ID}:${CUSTOMERIO_API_KEY}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

function isoToUnixTimestamp(isoString?: string): number {
  if (isoString) {
    return Math.floor(new Date(isoString).getTime() / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

export async function createOrUpdateProfile(
  email: string,
  attributes: Omit<CustomerIOProfileData, "email">
): Promise<CustomerIOResult> {
  if (!isCustomerIOConfigured()) {
    return { success: false, error: "Customer.io not configured" };
  }

  try {
    const response = await fetch(
      `${CUSTOMERIO_TRACK_URL}/customers/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          email,
          ...attributes,
        }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Customer.io profile update failed: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function trackEvent(
  email: string,
  event: CustomerIOEventData
): Promise<CustomerIOResult> {
  if (!isCustomerIOConfigured()) {
    return { success: false, error: "Customer.io not configured" };
  }

  try {
    const response = await fetch(
      `${CUSTOMERIO_TRACK_URL}/customers/${encodeURIComponent(email)}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          name: event.name,
          data: event.data,
          timestamp: event.timestamp ?? isoToUnixTimestamp(),
        }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Customer.io event tracking failed: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export interface TrackFormSubmissionOptions {
  email: string;
  eventName?: string;
  profileAttributes?: Record<string, string | number | boolean | undefined>;
  eventMetadata?: Record<string, string | number | boolean>;
  source?: string;
  pageSlug?: string;
  pageUrl?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

export async function trackFormSubmission(
  options: TrackFormSubmissionOptions
): Promise<CustomerIOResult> {
  const {
    email,
    eventName = "form_submission",
    profileAttributes = {},
    eventMetadata = {},
    source,
    pageSlug,
    pageUrl,
    utm = {},
  } = options;

  // First create/update the customer profile
  const profileResult = await createOrUpdateProfile(email, {
    ...profileAttributes,
    created_at: isoToUnixTimestamp(),
  });

  if (!profileResult.success) {
    // Profile update is best-effort; event tracking may still succeed
  }

  // Build event data
  const eventData: Record<string, unknown> = {
    ...eventMetadata,
    submitted_at: new Date().toISOString(),
  };

  // Add source if provided
  if (source) {
    eventData.source = source;
  }

  // Add page information if provided
  if (pageSlug) {
    eventData.page_slug = pageSlug;
  }
  if (pageUrl) {
    eventData.page_url = pageUrl;
  }

  // Add UTM parameters if provided
  if (utm.source) eventData.utm_source = utm.source;
  if (utm.medium) eventData.utm_medium = utm.medium;
  if (utm.campaign) eventData.utm_campaign = utm.campaign;
  if (utm.content) eventData.utm_content = utm.content;
  if (utm.term) eventData.utm_term = utm.term;

  // Track the event
  return trackEvent(email, {
    name: eventName,
    data: eventData,
    timestamp: isoToUnixTimestamp(),
  });
}

