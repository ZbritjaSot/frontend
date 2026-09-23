import type { Metadata } from "next";
import { AdminSubscriptions } from "@/features/admin/AdminSubscriptions";

export const metadata: Metadata = {
  title: "Abonimet",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionsPage() {
  return <AdminSubscriptions />;
}
