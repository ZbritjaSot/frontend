import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-charcoal"
      >
        Kalo te përmbajtja
      </a>
      <Suspense
        fallback={
          <div className="min-h-16 border-b border-line bg-chrome" aria-hidden />
        }
      >
        <SiteHeader showExclusive />
      </Suspense>
      <main id="main" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
