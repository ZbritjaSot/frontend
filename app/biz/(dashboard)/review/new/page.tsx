import type { Metadata } from "next";
import { ManagerCreateOffer } from "@/features/biz/ManagerCreateOffer";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Krijo",
  robots: { index: false, follow: false },
};

export default async function ManagerNewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const catalog = params.kind === "offers" ? "offers" : "flyers";

  return <PageWidth variant="form"><ManagerCreateOffer catalog={catalog} /></PageWidth>;
}
