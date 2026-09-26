import type { Metadata } from "next";
import { ManagerEdit } from "@/features/biz/ManagerEdit";

export const metadata: Metadata = {
  title: "Ndrysho dosjen",
  robots: { index: false, follow: false },
};

export default async function ManagerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManagerEdit id={id} />;
}
