/**
 * Prayer Wall safety rules, shared by the client (live warnings) and the server
 * (enforcement). Pure — no imports — so it is unit-testable with plain node.
 */

/** A post is hidden from the feed once this many different people report it. */
export const REPORT_HIDE_THRESHOLD = 3;

/** Posting rate limits, per signed-in user (or per device when anonymous). */
export const POST_LIMIT_SHORT = 3;
export const POST_LIMIT_SHORT_MINUTES = 10;
export const POST_LIMIT_DAILY = 10;

/** Max characters for a post or reply body. */
export const WALL_MAX_BODY = 280;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
// 7+ digits with common separators, e.g. 555-1234, (555) 123-4567, +1 555 123 4567
const PHONE_CANDIDATE_RE = /\+?\d[\d\s().-]{5,}\d/g;
const ADDRESS_RE =
  /\b\d{1,6}\s+(?:[A-Za-z0-9.'-]+\s+){0,3}(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl|circle|cir|parkway|pkwy|highway|hwy|terrace|ter|trail|trl)\b\.?/i;
const URL_RE = /\bhttps?:\/\/\S+|\bwww\.\S+/i;

export function containsPhone(text: string): boolean {
  for (const m of text.match(PHONE_CANDIDATE_RE) ?? []) {
    const trimmed = m.trim();
    // Dates like 2024-05-12 or 05/12/2024 are not phone numbers.
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) continue;
    if (m.replace(/\D/g, "").length >= 7) return true;
  }
  return false;
}

export function containsEmail(text: string): boolean {
  return EMAIL_RE.test(text);
}

export interface PrivacyCheck {
  /** Hard stops — the post cannot be published while these are present. */
  blocked: string[];
  /** Gentle nudges — allowed, but worth a second look. */
  warnings: string[];
}

export function checkWallPrivacy(text: string): PrivacyCheck {
  const blocked: string[] = [];
  const warnings: string[] = [];
  if (containsPhone(text)) {
    blocked.push("Please remove the phone number. The circle is public.");
  }
  if (containsEmail(text)) {
    blocked.push("Please remove the email address. The circle is public.");
  }
  if (ADDRESS_RE.test(text)) {
    warnings.push("This looks like it might include a street address. Consider leaving it out.");
  }
  if (URL_RE.test(text)) {
    warnings.push("Links are removed from public posts.");
  }
  return { blocked, warnings };
}
