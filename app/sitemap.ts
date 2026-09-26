import type { MetadataRoute } from "next";
import { getApiUrl, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

type SitemapIds = {
  offers: string[];
  businesses: string[];
};

async function fetchSitemapIds(): Promise<SitemapIds> {
  try {
    const response = await fetch(`${getApiUrl()}/api/v1/sitemap`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return { offers: [], businesses: [] };
    }
    const body = (await response.json()) as Partial<SitemapIds>;
    return {
      offers: Array.isArray(body.offers) ? body.offers : [],
      businesses: Array.isArray(body.businesses) ? body.businesses : [],
    };
  } catch {
    return { offers: [], businesses: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { offers, businesses } = await fetchSitemapIds();
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privatesia`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/kushtet`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/biznese`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...offers.map((id) => ({
      url: `${SITE_URL}/offers/${id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...businesses.map((id) => ({
      url: `${SITE_URL}/biznese/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
