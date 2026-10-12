import type { Metadata } from "next";
import { ManagerCreateOffer } from "@/features/biz/ManagerCreateOffer";

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

  return <ManagerCreateOffer catalog={catalog} />;
}
