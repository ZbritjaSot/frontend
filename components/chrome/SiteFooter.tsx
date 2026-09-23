import { SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-elevated px-5 py-8 text-center text-muted sm:px-8">
      <p className="m-0 text-xs font-semibold tracking-[0.18em] uppercase">
        {SITE_TAGLINE}
      </p>
      <p className="mt-3 mb-0 text-[0.8125rem]">
        © {new Date().getFullYear()} ZbritjaSot
      </p>
    </footer>
  );
}
