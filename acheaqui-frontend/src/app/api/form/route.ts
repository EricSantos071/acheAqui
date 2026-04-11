import { NextRequest, NextResponse } from "next/server";
import { validateCSRFToken, extractCSRFTokenFromHeader } from "@/lib/csrf";
import { validateFormData, detectBot } from "@/lib/security";
import { submitToHubSpotForm, upsertHubSpotContact } from "@/lib/integrations/hubspot";
import { trackFormSubmission } from "@/lib/integrations/customerio";

interface FormSubmissionBody {
  fields: Record<string, string>;
  hubspotPortalId?: string;
  hubspotFormId?: string;
  formName: string;
  pageSlug?: string;
  pageUrl?: string;
  gdprConsent?: boolean;
  submissionTime?: number;
  /** Customer.io event configuration */
  customerio?: {
    /** Custom event name (defaults to "form_submission") */
    eventName?: string;
    /** Additional metadata to include with the event */
    metadata?: Record<string, string | number | boolean>;
  };
}

/**
 * POST /api/form - Handle form submissions
 *
 * Security measures:
 * - CSRF token validation
 * - Origin validation (via proxy)
 * - Rate limiting (via proxy)
 * - Bot detection
 * - Input sanitization and XSS prevention
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Validate CSRF token
    const csrfToken = extractCSRFTokenFromHeader(request);
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: "Invalid or expired security token. Please refresh and try again." },
        { status: 403 }
      );
    }

    // 2. Parse request body
    let body: FormSubmissionBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // 3. Validate required fields
    if (!body.fields || typeof body.fields !== "object") {
      return NextResponse.json(
        { error: "Missing form fields" },
        { status: 400 }
      );
    }

    if (!body.formName || typeof body.formName !== "string") {
      return NextResponse.json(
        { error: "Missing form name" },
        { status: 400 }
      );
    }

    // 4. Bot detection
    const botCheck = detectBot(request, body.submissionTime);
    if (botCheck.isBot) {
      // Return success to avoid giving bots feedback
      // but don't actually process the submission
      // Silently reject bot submissions
      return NextResponse.json({ success: true });
    }

    // 5. Validate and sanitize form data
    const validation = validateFormData(body.fields);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const sanitizedFields = validation.sanitizedData;

    // 6. Require email field
    if (!sanitizedFields.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 7. Get client IP for HubSpot context
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 8. Submit to HubSpot (if configured)
    if (body.hubspotPortalId && body.hubspotFormId) {
      await submitToHubSpotForm(
        body.hubspotPortalId,
        body.hubspotFormId,
        sanitizedFields,
        {
          pageUri: body.pageUrl,
          pageName: body.formName,
          ipAddress: clientIP,
        },
        body.gdprConsent || false
      );
      // Continue with Customer.io even if HubSpot fails
    } else {
      // If no HubSpot form configured, use Contacts API (best-effort)
      await upsertHubSpotContact({
        email: sanitizedFields.email,
        firstname: sanitizedFields.firstName,
        lastname: sanitizedFields.lastName,
        company: sanitizedFields.company,
        phone: sanitizedFields.phone,
      });
    }

    // 9. Track in Customer.io with configurable event name and metadata (best-effort)
    await trackFormSubmission({
      email: sanitizedFields.email,
      eventName: body.customerio?.eventName || "form_submission",
      profileAttributes: {
        firstName: sanitizedFields.firstName,
        lastName: sanitizedFields.lastName,
        company: sanitizedFields.company,
      },
      eventMetadata: {
        form_name: body.formName,
        ...(body.customerio?.metadata || {}),
      },
      source: body.formName,
      pageSlug: body.pageSlug,
      pageUrl: body.pageUrl,
      utm: {
        source: sanitizedFields.utm_source,
        medium: sanitizedFields.utm_medium,
        campaign: sanitizedFields.utm_campaign,
        content: sanitizedFields.utm_content,
        term: sanitizedFields.utm_term,
      },
    });

    // 10. Return success
    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch {
    // Unexpected error -- details are not exposed to the client
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token",
    },
  });
}
