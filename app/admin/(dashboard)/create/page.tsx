import type { Metadata } from "next";
import { AdminAddContent } from "@/features/admin/AdminAddContent";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Shto përmbajtje",
  robots: { index: false, follow: false },
};

export default function AdminCreatePage() {
  return <PageWidth variant="list"><AdminAddContent /></PageWidth>;
}
