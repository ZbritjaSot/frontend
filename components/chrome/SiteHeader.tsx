"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { EXCLUSIVE_HREF, EXCLUSIVE_LABEL } from "@/lib/exclusive";

const links = [
  { href: "/oferta", label: "Ofertat", match: "oferta" },
  { href: "/fletushka", label: "Fletushkat", match: "fletushka" },
] as const;

const PARTNERS_HREF = "/biznese";
const PARTNERS_LABEL = "Partnerët";

const iconHit =
  "inline-flex size-10 items-center justify-center rounded-xl text-chrome-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function SiteHeader({ showExclusive = true }: { showExclusive?: boolean }) {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const onSettings = pathname.startsWith("/cilesimet");
  const onFavorites = pathname.startsWith("/preferuarat");

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function active(match: (typeof links)[number]["match"]): boolean {
    if (match === "oferta") {
      return pathname === "/oferta" || pathname.startsWith("/oferta/") || pathname.startsWith("/offers");
    }
    return pathname === "/fletushka" || pathname.startsWith("/fletushka/") || pathname.startsWith("/dosje");
  }

  const partnersActive =
    pathname === PARTNERS_HREF || pathname.startsWith(`${PARTNERS_HREF}/`);
  const exclusiveActive = pathname === EXCLUSIVE_HREF;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-chrome text-chrome-text backdrop-blur-md dark:border-white/8 dark:bg-chrome/90">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-5 sm:gap-8 sm:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label="ZbritjaSot — kryefaqja"
          onClick={() => setOpen(false)}
        >
          <LogoMark size={34} priority />
          <Wordmark tone="chrome" className="text-xl" />
        </Link>

        <nav
          aria-label="Kryesore"
          className="hidden min-w-0 flex-1 items-center gap-5 overflow-x-auto [scrollbar-width:none] md:flex sm:gap-7 [&::-webkit-scrollbar]:hidden"
        >
          {links.map((link) => {
            const current = active(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`inline-flex min-h-11 shrink-0 items-center border-b-2 text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                  current
                    ? "border-accent text-chrome-text"
                    : "border-transparent text-chrome-muted hover:text-chrome-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <NavPill
            href={PARTNERS_HREF}
            label={PARTNERS_LABEL}
            active={partnersActive}
            pulse={!partnersActive}
            onNavigate={() => setOpen(false)}
          />
          {showExclusive ? (
            <NavPill
              href={EXCLUSIVE_HREF}
              label={EXCLUSIVE_LABEL}
              active={exclusiveActive}
              onNavigate={() => setOpen(false)}
            />
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <button
            type="button"
            className={`${iconHit} cursor-pointer hover:bg-white/10 md:hidden`}
            aria-label={open ? "Mbyll menynë" : "Hap menynë"}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link
            href="/preferuarat"
            aria-label="Të preferuarat"
            aria-current={onFavorites ? "page" : undefined}
            title="Të preferuarat"
            onClick={() => setOpen(false)}
            className={`${iconHit} ${
              onFavorites
                ? "border border-line bg-elevated text-[#ff6b7a]"
                : "hover:bg-white/10"
            }`}
          >
            {onFavorites ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </Link>
          <Link
            href="/cilesimet"
            aria-label="Cilësimet"
            aria-current={onSettings ? "page" : undefined}
            title="Cilësimet"
            onClick={() => setOpen(false)}
            className={`${iconHit} ${
              onSettings
                ? "border border-line bg-elevated"
                : "hover:bg-white/10"
            }`}
          >
            <SettingsOutlinedIcon fontSize="small" />
          </Link>
        </div>
      </div>

      {open ? (
        <nav
          id={menuId}
          aria-label="Kryesore"
          className="mx-auto flex w-full max-w-7xl flex-col px-5 pt-1 pb-4 md:hidden"
        >
          {links.map((link) => {
            const current = active(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex min-h-12 items-center border-b border-line/70 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                  current ? "text-chrome-text" : "text-chrome-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="flex flex-wrap gap-3 pt-3">
            <NavPill
              href={PARTNERS_HREF}
              label={PARTNERS_LABEL}
              active={partnersActive}
              pulse={!partnersActive}
              onNavigate={() => setOpen(false)}
            />
            {showExclusive ? (
              <NavPill
                href={EXCLUSIVE_HREF}
                label={EXCLUSIVE_LABEL}
                active={exclusiveActive}
                onNavigate={() => setOpen(false)}
              />
            ) : null}
          </span>
        </nav>
      ) : null}
    </header>
  );
}

function NavPill({
  href,
  label,
  active,
  pulse = false,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  pulse?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`group inline-flex min-h-9 w-fit shrink-0 items-center gap-2 rounded-full border px-3 text-[0.68rem] font-extrabold tracking-[0.14em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-3.5 sm:tracking-[0.18em] ${
        active
          ? "border-accent bg-accent text-charcoal"
          : "border-accent/80 text-chrome-text hover:bg-accent hover:text-charcoal"
      }`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-[2px] ${
          active
            ? "bg-charcoal"
            : pulse
              ? "bg-accent partner-dot-pulse group-hover:bg-charcoal group-hover:[animation:none]"
              : "bg-accent group-hover:bg-charcoal"
        }`}
      />
      {label}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
