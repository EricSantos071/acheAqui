const MAX_FIELD_LENGTHS: Record<string, number> = {
  email: 254, // RFC 5321
  firstName: 100,
  lastName: 100,
  company: 200,
  phone: 50,
  message: 5000,
  default: 1000,
};

// Patterns that indicate potential XSS attempts
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /data:/gi,
  /vbscript:/gi,
];

export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  let sanitized = input
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize Unicode
    .normalize("NFC")
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Trim whitespace
    .trim();

  // HTML entity encode dangerous characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized;
}

export function containsXSS(input: string): boolean {
  if (typeof input !== "string") return false;

  // First decode any HTML entities to catch encoded attacks
  const decoded = input
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");

  return XSS_PATTERNS.some((pattern) => pattern.test(decoded));
}

function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;

  // RFC 5322 compliant email regex (simplified but effective)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return email.length <= 254 && emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  if (typeof phone !== "string") return false;

  // Allow international format with optional country code
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  const digitsOnly = phone.replace(/\D/g, "");

  return (
    phone.length <= 50 &&
    phoneRegex.test(phone) &&
    digitsOnly.length >= 7 &&
    digitsOnly.length <= 15
  );
}

function isValidLength(
  value: string,
  fieldName: string,
  maxLength?: number
): boolean {
  const limit = maxLength || MAX_FIELD_LENGTHS[fieldName] || MAX_FIELD_LENGTHS.default;
  return typeof value === "string" && value.length <= limit;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, string>;
}

export function validateFormData(
  data: Record<string, unknown>
): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip non-string values
    if (typeof value !== "string") {
      continue;
    }

    // Check for XSS
    if (containsXSS(value)) {
      errors[key] = "Invalid characters detected";
      continue;
    }

    // Check field length
    if (!isValidLength(value, key)) {
      errors[key] = "Input too long";
      continue;
    }

    // Field-specific validation
    if (key === "email" && value && !isValidEmail(value)) {
      errors[key] = "Invalid email format";
      continue;
    }

    if (key === "phone" && value && !isValidPhone(value)) {
      errors[key] = "Invalid phone format";
      continue;
    }

    // Sanitize and store
    sanitizedData[key] = sanitizeString(value);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

export interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
}

export function detectBot(
  request: Request,
  submissionTime?: number
): BotDetectionResult {
  const userAgent = request.headers.get("user-agent") || "";

  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    return { isBot: true, reason: "Missing or invalid user agent" };
  }

  // Check for known bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /httpx/i,
    /node-fetch/i,
  ];

  // Allow legitimate bots in development
  if (process.env.NODE_ENV === "production") {
    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        return { isBot: true, reason: "Bot user agent detected" };
      }
    }
  }

  // Check for suspiciously fast form submission (honeypot timing)
  if (submissionTime !== undefined && submissionTime < 2000) {
    return { isBot: true, reason: "Form submitted too quickly" };
  }

  return { isBot: false };
}
