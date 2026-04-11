export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const UTM_STORAGE_KEY = "go_utm_params";

export function extractUTMParams(
  searchParams: URLSearchParams | Record<string, string>
): UTMParams {
  const utmParams: UTMParams = {};

  for (const param of UTM_PARAMS) {
    const value =
      searchParams instanceof URLSearchParams
        ? searchParams.get(param)
        : searchParams[param];

    if (value) {
      utmParams[param] = sanitizeUTMValue(value);
    }
  }

  return utmParams;
}

function sanitizeUTMValue(value: string): string {
  return value
    .trim()
    .slice(0, 200)
    .replace(/[<>]/g, "");
}

export function storeUTMParams(params: UTMParams): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getStoredUTMParams();
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem(
        UTM_STORAGE_KEY,
        JSON.stringify({ ...existing, ...params })
      );
    }
  } catch {
    // Session storage not available
  }
}

export function getStoredUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UTMParams;
    }
  } catch {
    // Session storage not available or invalid JSON
  }

  return {};
}
