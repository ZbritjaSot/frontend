import type { Metadata } from "next";
import { AdminSubscriptions } from "@/features/admin/AdminSubscriptions";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Abonimet",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionsPage() {
  return (
    <>
      <h1 className={pageTitle}>Abonimet cash</h1>
      <AdminSubscriptions />
    </>
  );
}
