import type { ReactNode } from "react";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
