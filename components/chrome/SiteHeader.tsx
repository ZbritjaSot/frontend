"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand" aria-label="ZbritjaSot — kryefaqja">
        <LogoMark size={36} priority />
        <Wordmark className="site-header__wordmark" />
      </Link>

      <div className="site-header__actions">
        <nav className="site-header__nav" aria-label="Kryesore">
          <Link href="/">Ofertat</Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
