import type { Metadata } from "next";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { NotFoundScreen } from "@/components/chrome/NotFoundScreen";

export const metadata: Metadata = {
  title: "Nuk u gjet",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 sm:px-8">
        <NotFoundScreen
          title="Kjo faqe nuk u gjet"
          description="Adresa nuk ekziston. Kthehu te ofertat e sotme."
        />
      </div>
      <SiteFooter />
    </div>
  );
}
