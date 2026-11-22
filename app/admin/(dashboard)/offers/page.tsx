import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminOffersBoard } from "@/features/admin/AdminOffersBoard";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Ofertat",
  robots: { index: false, follow: false },
};

export default function AdminOffersPage() {
  return (
    <PageWidth variant="list">
      <Suspense>
        <AdminOffersBoard />
      </Suspense>
    </PageWidth>
  );
}
