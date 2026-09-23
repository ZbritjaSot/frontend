import type { Metadata } from "next";
import { AdminPendingOffers } from "@/features/admin/AdminPendingOffers";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Në pritje",
  robots: { index: false, follow: false },
};

export default function AdminOffersPage() {
  return (
    <>
      <h1 className={pageTitle}>Në pritje</h1>
      <AdminPendingOffers />
    </>
  );
}
