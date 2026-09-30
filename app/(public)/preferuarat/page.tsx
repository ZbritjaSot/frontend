import type { Metadata } from "next";
import { FavoritesView } from "@/features/public/FavoritesView";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Të preferuarat",
  description: "Ofertat dhe fletushkat e ruajtura në këtë pajisje.",
  path: "/preferuarat",
});

export default function FavoritesPage() {
  return <FavoritesView />;
}
