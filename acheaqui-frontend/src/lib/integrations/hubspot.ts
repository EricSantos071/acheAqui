/**
 * HubSpot API integration for form submissions
 * Server-side only - never expose access token to client
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_URL = "https://api.hubapi.com";

interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  phone?: string;
  [key: string]: string | undefined;
}

interface HubSpotFormSubmission {
  portalId: string;
  formId: string;
  fields: Array<{ name: string; value: string }>;
  context: {
    pageUri?: string;
    pageName?: string;
    ipAddress?: string;
    hutk?: string;
  };
  legalConsentOptions?: {
    consent: {
      consentToProcess: boolean;
      text: string;
      communications?: Array<{
        value: boolean;
        subscriptionTypeId: number;
        text: string;
      }>;
    };
  };
}

export type HubSpotResult =
  | { success: true; contactId?: string }
  | { success: false; error: string };

/**
 * Submit form data to HubSpot via Forms API
 */
export async function submitToHubSpotForm(
  portalId: string,
  formId: string,
  fields: Record<string, string>,
  context: {
    pageUri?: string;
    pageName?: string;
    ipAddress?: string;
    hutk?: string;
  },
  hasGdprConsent: boolean
): Promise<HubSpotResult> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    return { success: false, error: "HubSpot not configured" };
  }

  try {
    const formFields = Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([name, value]) => ({ name, value }));

    const submission: HubSpotFormSubmission = {
      portalId,
      formId,
      fields: formFields,
      context: {
        pageUri: context.pageUri,
        pageName: context.pageName,
        ipAddress: context.ipAddress,
        hutk: context.hutk,
      },
    };

    if (hasGdprConsent) {
      submission.legalConsentOptions = {
        consent: {
          consentToProcess: true,
          text: "I agree to receive communications.",
        },
      };
    }

    const response = await fetch(
      `${HUBSPOT_API_URL}/submissions/v3/integration/secure/submit/${portalId}/${formId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(submission),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `HubSpot submission failed: ${response.status}`,
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

/**
 * Create or update a contact in HubSpot via Contacts API
 */
export async function upsertHubSpotContact(
  contact: HubSpotContact
): Promise<HubSpotResult> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    return { success: false, error: "HubSpot not configured" };
  }

  try {
    // First, try to find existing contact by email
    const searchResponse = await fetch(
      `${HUBSPOT_API_URL}/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: contact.email,
                },
              ],
            },
          ],
        }),
      }
    );

    const searchData = await searchResponse.json();
    const existingContact = searchData.results?.[0];

    // Build properties object
    const properties: Record<string, string> = { email: contact.email };
    if (contact.firstname) properties.firstname = contact.firstname;
    if (contact.lastname) properties.lastname = contact.lastname;
    if (contact.company) properties.company = contact.company;
    if (contact.phone) properties.phone = contact.phone;

    // Add any custom properties
    for (const [key, value] of Object.entries(contact)) {
      if (
        value &&
        !["email", "firstname", "lastname", "company", "phone"].includes(key)
      ) {
        properties[key] = value;
      }
    }

    if (existingContact) {
      // Update existing contact
      const updateResponse = await fetch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts/${existingContact.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!updateResponse.ok) {
        return { success: false, error: "Failed to update contact" };
      }

      return { success: true, contactId: existingContact.id };
    } else {
      // Create new contact
      const createResponse = await fetch(
        `${HUBSPOT_API_URL}/crm/v3/objects/contacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({ properties }),
        }
      );

      if (!createResponse.ok) {
        return { success: false, error: "Failed to create contact" };
      }

      const createData = await createResponse.json();
      return { success: true, contactId: createData.id };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
