import type { Metadata } from "next";
import { ManagerEdit } from "@/features/biz/ManagerEdit";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Ndrysho fletushkën",
  robots: { index: false, follow: false },
};

export default async function ManagerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageWidth variant="form"><ManagerEdit id={id} /></PageWidth>;
}
