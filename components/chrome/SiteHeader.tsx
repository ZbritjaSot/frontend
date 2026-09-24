"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-chrome/92 text-chrome-text backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3"
          aria-label="ZbritjaSot — kryefaqja"
        >
          <LogoMark size={34} priority />
          <Wordmark tone="chrome" className="text-xl" />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-chrome-muted hover:text-chrome-text"
          >
            Ofertat
          </Link>
          <ThemeToggle className="border-white/15 bg-transparent text-chrome-muted hover:border-white/40 hover:text-chrome-text" />
        </div>
      </div>
    </header>
  );
}
