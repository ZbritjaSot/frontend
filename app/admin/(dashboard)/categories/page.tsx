import type { Metadata } from "next";
import { AdminCategories } from "@/features/admin/AdminCategories";
import { pageTitle } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Kategoritë",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <>
      <h1 className={pageTitle}>Kategoritë</h1>
      <AdminCategories />
    </>
  );
}
