import type { Metadata } from "next";
import { AdminPendingOffers } from "@/features/admin/AdminPendingOffers";

export const metadata: Metadata = {
  title: "Ofertat në pritje",
  robots: { index: false, follow: false },
};

export default function AdminOffersPage() {
  return (
    <>
      <h1 className="dash__page-title">Ofertat në pritje</h1>
      <AdminPendingOffers />
    </>
  );
}
