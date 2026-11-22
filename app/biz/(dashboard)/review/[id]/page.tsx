import type { Metadata } from "next";
import { ManagerInspect } from "@/features/biz/ManagerInspect";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Shiko fletushkën",
  robots: { index: false, follow: false },
};

export default async function ManagerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageWidth variant="list"><ManagerInspect id={id} /></PageWidth>;
}
