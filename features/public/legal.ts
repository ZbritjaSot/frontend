/**
 * Legal owner sets these. Use a real revision date such as "21 nëntor 2026".
 * An empty string renders nothing — do not invent a date.
 */
export const PRIVACY_LEGAL_LAST_UPDATED = "";

/** Same rule as `PRIVACY_LEGAL_LAST_UPDATED`, for /kushtet. */
export const TERMS_LEGAL_LAST_UPDATED = "";

/** "Përditësuar më …", or null when the legal owner has not supplied a date. */
export function legalUpdatedText(date: string): string | null {
  const trimmed = date.trim();
  if (trimmed === "") {
    return null;
  }
  return `Përditësuar më ${trimmed}`;
}
