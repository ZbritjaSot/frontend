import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

const legalLinks = [
  { label: "Privatësia", href: "/privatesia" },
  { label: "Kushtet", href: "/kushtet" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer__nav" aria-label="Linket ligjore">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="site-footer__link">
            {link.label}
          </Link>
        ))}
        <a href={`mailto:${SITE_EMAIL}`} className="site-footer__link">
          {SITE_EMAIL}
        </a>
      </nav>
      <p className="site-footer__copy">
        © {new Date().getFullYear()} ZbritjaSot. Të gjitha të drejtat e rezervuara.
      </p>
    </footer>
  );
}
