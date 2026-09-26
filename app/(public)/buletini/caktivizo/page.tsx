import type { Metadata } from "next";
import { UnsubscribeNewsletter } from "@/features/public/UnsubscribeNewsletter";

export const metadata: Metadata = {
  title: "Çregjistrohu",
  description: "Ndalo njoftimet e buletinit të ZbritjaSot.",
  robots: { index: false, follow: false },
};

export default async function UnsubscribeNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return <UnsubscribeNewsletter token={params.token ?? ""} />;
}
