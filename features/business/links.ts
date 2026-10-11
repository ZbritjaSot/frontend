import type { Business, PublicBusiness } from "@/types";

export type BusinessLinksInput = {
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  whatsapp: string | null;
};

export function linksFromBusiness(
  business: Pick<
    Business | PublicBusiness,
    "website_url" | "instagram_url" | "facebook_url" | "whatsapp"
  >,
): BusinessLinksInput {
  return {
    website_url: business.website_url ?? null,
    instagram_url: business.instagram_url ?? null,
    facebook_url: business.facebook_url ?? null,
    whatsapp: business.whatsapp ?? null,
  };
}

export function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Digits only for the WhatsApp field (UI shows a fixed + prefix). */
export function sanitizeWhatsappInput(value: string): string {
  return value.replace(/\D+/g, "").slice(0, 15);
}

export function whatsappHref(whatsapp: string): string | null {
  const digits = whatsapp.replace(/\D+/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return null;
  }
  return `https://wa.me/${digits}`;
}

/** Only allow http(s) hrefs in the public UI (defense in depth). */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (!parsed.hostname) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export type ShopLink = {
  key: "website" | "instagram" | "facebook" | "whatsapp";
  label: string;
  href: string;
};

export function shopLinks(
  business: Pick<
    Business | PublicBusiness,
    "website_url" | "instagram_url" | "facebook_url" | "whatsapp"
  >,
): ShopLink[] {
  const links: ShopLink[] = [];
  const website = safeHttpUrl(business.website_url);
  if (website) {
    links.push({ key: "website", label: "Website", href: website });
  }
  const instagram = safeHttpUrl(business.instagram_url);
  if (instagram) {
    links.push({ key: "instagram", label: "Instagram", href: instagram });
  }
  const facebook = safeHttpUrl(business.facebook_url);
  if (facebook) {
    links.push({ key: "facebook", label: "Facebook", href: facebook });
  }
  const whatsapp = business.whatsapp ? whatsappHref(business.whatsapp) : null;
  if (whatsapp) {
    links.push({ key: "whatsapp", label: "WhatsApp", href: whatsapp });
  }
  return links;
}

/** Prefer WhatsApp, then website, then other social profiles. */
export function primaryContactHref(
  business: Pick<
    Business | PublicBusiness,
    "website_url" | "instagram_url" | "facebook_url" | "whatsapp"
  >,
): string | null {
  const links = shopLinks(business);
  const preferred = ["whatsapp", "website", "facebook", "instagram"] as const;
  for (const key of preferred) {
    const match = links.find((link) => link.key === key);
    if (match) {
      return match.href;
    }
  }
  return null;
}
