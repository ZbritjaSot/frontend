import type { Metadata } from "next";
import { AdminPlatformGallery } from "@/features/admin/AdminPlatformGallery";

export const metadata: Metadata = {
  title: "Galeria ZbritjaSot",
  robots: { index: false, follow: false },
};

export default function AdminGalleryPage() {
  return <AdminPlatformGallery />;
}
