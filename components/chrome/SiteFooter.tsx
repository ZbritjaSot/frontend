import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SITE_TAGLINE } from "@/lib/site";

const link =
  "text-sm font-semibold text-ivory/90 underline-offset-4 hover:text-ivory hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:text-ink dark:hover:text-ink";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-forest text-ivory dark:bg-[#101614] dark:text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark tone="inverse" className="text-2xl" />
            <p className="mt-3 mb-0 max-w-xs text-sm leading-relaxed text-ivory/70 dark:text-muted">
              {SITE_TAGLINE}
            </p>
          </div>
          <nav aria-label="Fundi i faqes" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className={link}>
              Kreu
            </Link>
            <Link href="/?katalog=oferta" className={link}>
              Ofertat
            </Link>
            <Link href="/?katalog=fletushka" className={link}>
              Fletushkat
            </Link>
            <Link href="/biznese" className={link}>
              Dyqanet
            </Link>
            <Link href="/privatesia" className={link}>
              Privatësia
            </Link>
            <Link href="/kushtet" className={link}>
              Kushtet
            </Link>
          </nav>
        </div>
        <p className="m-0 text-sm text-ivory/60 dark:text-muted">
          © {new Date().getFullYear()} ZbritjaSot
        </p>
      </div>
    </footer>
  );
}
