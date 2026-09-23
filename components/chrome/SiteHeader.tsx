"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-5 border-b border-chrome-text/8 bg-chrome/94 px-5 py-3 text-chrome-text backdrop-blur-md sm:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-3"
        aria-label="ZbritjaSot — kryefaqja"
      >
        <LogoMark size={36} priority />
        <Wordmark tone="chrome" className="text-xl" />
      </Link>

      <div className="flex items-center gap-5">
        <nav
          className="flex gap-5 text-sm font-semibold tracking-[0.04em] text-chrome-muted uppercase [&_a:hover]:text-accent"
          aria-label="Kryesore"
        >
          <Link href="/">Ofertat</Link>
        </nav>
        <ThemeToggle className="border-chrome-text/18 bg-transparent text-chrome-muted hover:border-chrome-text/35 hover:text-chrome-text light:border-chrome-text/60 light:text-chrome-text light:hover:border-accent light:hover:text-accent" />
      </div>
    </header>
  );
}
