"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { readKatalog } from "@/lib/browse";
import { EXCLUSIVE_HREF, EXCLUSIVE_LABEL } from "@/lib/exclusive";

const links = [
  { href: "/?katalog=oferta", label: "Ofertat", match: "oferta" },
  { href: "/?katalog=fletushka", label: "Fletushkat", match: "fletushka" },
  { href: "/biznese", label: "Dyqanet", match: "dyqane" },
] as const;

export function SiteHeader({ showExclusive = true }: { showExclusive?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const katalog = readKatalog(params.get("katalog") ?? undefined);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-chrome text-chrome-text backdrop-blur-md dark:border-white/8 dark:bg-chrome/90">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-5 sm:gap-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label="ZbritjaSot — kryefaqja"
        >
          <LogoMark size={34} priority />
          <Wordmark tone="chrome" className="text-xl" />
        </Link>

        <nav
          aria-label="Kryesore"
          className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto [scrollbar-width:none] sm:gap-7 [&::-webkit-scrollbar]:hidden"
        >
          {links.map((link) => {
            const active =
              link.match === "oferta"
                ? katalog === "oferta" || pathname.startsWith("/offers")
                : link.match === "dyqane"
                  ? pathname === "/biznese"
                  : katalog === "fletushka" || pathname.startsWith("/dosje");

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 shrink-0 items-center border-b-2 text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                  active
                    ? "border-accent text-chrome-text"
                    : "border-transparent text-chrome-muted hover:text-chrome-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {showExclusive ? (
          <Link
            href={EXCLUSIVE_HREF}
            aria-current={pathname === EXCLUSIVE_HREF ? "page" : undefined}
            className={`group inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-[0.68rem] font-extrabold tracking-[0.14em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-3.5 sm:tracking-[0.18em] ${
              pathname === EXCLUSIVE_HREF
                ? "border-accent bg-accent text-charcoal"
                : "border-accent/80 text-chrome-text hover:bg-accent hover:text-charcoal"
            }`}
          >
            <span
              aria-hidden
              className={`size-1.5 rounded-[2px] ${
                pathname === EXCLUSIVE_HREF
                  ? "bg-charcoal"
                  : "bg-accent group-hover:bg-charcoal"
              }`}
            />
            {EXCLUSIVE_LABEL}
          </Link>
        ) : null}

        <ThemeToggle />
      </div>
    </header>
  );
}
