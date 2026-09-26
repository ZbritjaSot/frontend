import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { fetchPublicSections } from "@/features/offers/api";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  let showExclusive = true;
  try {
    const sections = await fetchPublicSections();
    showExclusive = sections.some((section) => section.key === "exclusive");
  } catch {
    showExclusive = true;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense
        fallback={
          <div className="min-h-16 border-b border-line bg-chrome" aria-hidden />
        }
      >
        <SiteHeader showExclusive={showExclusive} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
