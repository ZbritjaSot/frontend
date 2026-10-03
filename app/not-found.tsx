import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { BackLink, EmptyNote, Frame } from "@/features/public/Frame";

export const metadata: Metadata = {
  title: "Faqja nuk u gjet",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense
        fallback={
          <div className="min-h-16 border-b border-line bg-chrome" aria-hidden />
        }
      >
        <SiteHeader showExclusive />
      </Suspense>
      <main className="flex-1">
        <Frame className="py-16">
          <EmptyNote
            title="Faqja nuk u gjet"
            body="Kjo adresë nuk ekziston ose është zhvendosur. Provo nga faqja kryesore."
          />
          <p className="mt-6">
            <BackLink href="/">Kthehu te ofertat</BackLink>
          </p>
        </Frame>
      </main>
      <SiteFooter />
    </div>
  );
}
