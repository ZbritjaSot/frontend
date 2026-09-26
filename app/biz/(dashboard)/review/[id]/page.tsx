import type { Metadata } from "next";
import { ManagerInspect } from "@/features/biz/ManagerInspect";

export const metadata: Metadata = {
  title: "Shiko dosjen",
  robots: { index: false, follow: false },
};

export default async function ManagerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManagerInspect id={id} />;
}
