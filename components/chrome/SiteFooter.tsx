import Link from "next/link";
import { SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-elevated px-5 py-8 text-center text-muted sm:px-8">
      <p className="m-0 text-xs font-semibold tracking-[0.18em] uppercase">
        {SITE_TAGLINE}
      </p>
      <nav
        className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold"
        aria-label="Ligjore"
      >
        <Link href="/privatesia" className="hover:text-accent">
          Politika e privatësisë
        </Link>
        <Link href="/kushtet" className="hover:text-accent">
          Kushtet e përdorimit
        </Link>
      </nav>
      <p className="mt-4 mb-0 text-[0.8125rem]">
        © {new Date().getFullYear()} ZbritjaSot
      </p>
    </footer>
  );
}
