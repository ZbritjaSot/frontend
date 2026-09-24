import { Wordmark } from "@/components/brand/Wordmark";
import { SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-3 mb-0 max-w-xs text-sm leading-relaxed text-muted">
            {SITE_TAGLINE}
          </p>
        </div>
        <p className="m-0 text-sm text-muted">
          © {new Date().getFullYear()} ZbritjaSot
        </p>
      </div>
    </footer>
  );
}
