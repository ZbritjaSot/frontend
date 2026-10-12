"use client";

import Link from "next/link";
import { btnPrimary } from "@/lib/ui";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-8 text-center">
      <h1 className="m-0 text-xl font-bold tracking-[-0.02em]">
        Diçka shkoi keq
      </h1>
      <p className="m-0 max-w-md text-sm leading-relaxed text-muted">
        Faqja nuk u ngarkua si duhet. Provo përsëri, ose kthehu te faqja
        kryesore.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className={btnPrimary} type="button" onClick={reset}>
          Provo përsëri
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-bold text-muted no-underline hover:text-accent"
        >
          Faqja kryesore
        </Link>
      </div>
    </main>
  );
}
