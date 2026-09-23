import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminOffersBoard } from "@/features/admin/AdminOffersBoard";

export const metadata: Metadata = {
  title: "Ofertat",
  robots: { index: false, follow: false },
};

export default function AdminOffersPage() {
  return (
    <Suspense>
      <AdminOffersBoard />
    </Suspense>
  );
}
