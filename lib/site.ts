export const SITE_URL = "https://www.zbritjasot.com";
export const SITE_NAME = "ZbritjaSot";
export const SITE_WORDMARK = "Zbritja Sot";
export const SITE_TAGLINE = "Më shumë zbritje. Më shumë kursim.";
export const SITE_DESCRIPTION =
  "ZbritjaSot — platforma e zbritjeve në Kosovë. Gjej ofertat e ditës nga dyqanet lokale. Së shpejti.";

/** Laravel API base (trailing slash stripped). */
export function getApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return raw.replace(/\/$/, "");
}
