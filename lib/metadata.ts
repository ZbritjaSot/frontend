import type { Metadata } from "next";

/** Shared tags for an indexable public page. `path` is relative to the site origin. */
export function publicPageMetadata({
  title,
  description,
  path,
  image,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  index?: boolean;
}): Metadata {
  const images = image ? [image] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
