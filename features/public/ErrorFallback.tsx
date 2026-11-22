"use client";

import Link from "next/link";
import { Frame } from "@/features/public/Frame";
import { button } from "@/lib/ui";

export function ErrorFallback({
  reset,
  variant,
}: {
  reset: () => void;
  /** `content` sits in the public layout. `bare` is the full page for other routes. */
  variant: "content" | "bare";
}) {
  const actions = (
    <div
      className={`flex flex-wrap items-center gap-3 ${variant === "bare" ? "justify-center" : ""}`}
    >
      <button className={button()} type="button" onClick={reset}>
        Provo përsëri
      </button>
      <Link href="/" className={button({ variant: "secondary" })}>
        Faqja kryesore
      </Link>
    </div>
  );

  if (variant === "content") {
    return (
      <Frame className="py-16">
        <div className="max-w-xl">
          <h1 className="m-0 text-title-2">Diçka shkoi keq</h1>
          <p className="mt-4 mb-0 max-w-md text-base leading-relaxed text-muted">
            Faqja nuk u ngarkua si duhet. Provo përsëri, ose kthehu te faqja kryesore.
          </p>
          <div className="mt-6">{actions}</div>
        </div>
      </Frame>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-8 text-center">
      <h1 className="m-0 text-xl font-bold tracking-[-0.02em]">Diçka shkoi keq</h1>
      <p className="m-0 max-w-md text-sm leading-relaxed text-muted">
        Faqja nuk u ngarkua si duhet. Provo përsëri, ose kthehu te faqja kryesore.
      </p>
      {actions}
    </main>
  );
}
