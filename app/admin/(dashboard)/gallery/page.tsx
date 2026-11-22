import type { Metadata } from "next";
import { AdminPlatformGallery } from "@/features/admin/AdminPlatformGallery";
import { PageWidth } from "@/components/chrome/PageWidth";

export const metadata: Metadata = {
  title: "Galeria ZbritjaSot",
  robots: { index: false, follow: false },
};

export default function AdminGalleryPage() {
  return <PageWidth variant="list"><AdminPlatformGallery /></PageWidth>;
}
