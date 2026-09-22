import type { ReactNode } from "react";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <SiteHeader />
      <div className="public-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
