import { SITE_TAGLINE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__tagline">{SITE_TAGLINE}</p>
      <p className="site-footer__meta">© {new Date().getFullYear()} ZbritjaSot · Kosovë · EUR</p>
    </footer>
  );
}
