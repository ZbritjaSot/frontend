import type { Metadata } from "next";
import { AdminSubscriptions } from "@/features/admin/AdminSubscriptions";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Abonimet",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionsPage() {
  return <PageWidth variant="list"><AdminSubscriptions /></PageWidth>;
}
