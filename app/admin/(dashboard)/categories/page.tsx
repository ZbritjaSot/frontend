import type { Metadata } from "next";
import { AdminCategories } from "@/features/admin/AdminCategories";

export const metadata: Metadata = {
  title: "Kategoritë",
  robots: { index: false, follow: false },
};

export default function AdminCategoriesPage() {
  return (
    <>
      <h1 className="dash__page-title">Kategoritë</h1>
      <AdminCategories />
    </>
  );
}
