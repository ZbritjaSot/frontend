import type { Metadata } from "next";
import { AdminCities } from "@/features/admin/AdminCities";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Qytetet",
  robots: { index: false, follow: false },
};

export default function AdminCitiesPage() {
  return <PageWidth variant="list"><AdminCities /></PageWidth>;
}
