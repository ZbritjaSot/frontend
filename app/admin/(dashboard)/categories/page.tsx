import type { Metadata } from "next";
import { AdminCategories } from "@/features/admin/AdminCategories";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Kategoritë",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return <PageWidth variant="list"><AdminCategories /></PageWidth>;
}
