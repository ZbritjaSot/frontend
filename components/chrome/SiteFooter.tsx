import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { NewsletterSignup } from "@/features/public/NewsletterSignup";
import { SITE_EMAIL, SITE_TAGLINE } from "@/lib/site";

const link =
  "text-sm font-semibold text-ivory/90 underline-offset-4 hover:text-ivory hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-forest text-ivory">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark tone="inverse" className="text-2xl" />
            <p className="mt-3 mb-0 max-w-xs text-sm leading-relaxed text-ivory/70">
              {SITE_TAGLINE}
            </p>
            <a href={`mailto:${SITE_EMAIL}`} className={`${link} mt-3 inline-flex`}>
              {SITE_EMAIL}
            </a>
          </div>
          <nav aria-label="Fundi i faqes" className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/oferta" className={link}>
                Ofertat
              </Link>
              <Link href="/fletushka" className={link}>
                Fletushkat
              </Link>
              <Link href="/biznese" className={link}>
                Partnerët
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/privatesia" className={link}>
                Privatësia
              </Link>
              <Link href="/kushtet" className={link}>
                Kushtet
              </Link>
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-ivory/10 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <NewsletterSignup variant="footer" />
          <p className="m-0 text-sm text-ivory/60 dark:text-muted">
            © {new Date().getFullYear()} ZbritjaSot
          </p>
        </div>
      </div>
    </footer>
  );
}
