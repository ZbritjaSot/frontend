import type { ReactNode } from "react";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-14">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
