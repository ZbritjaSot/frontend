"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { LogoutButton } from "@/features/auth/LogoutButton";

export type DashboardNavItem = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  area: "admin" | "biz";
  nav: DashboardNavItem[];
  children: ReactNode;
  showLogout?: boolean;
  logoutRedirectTo?: string;
};

export function DashboardShell({
  area,
  nav,
  children,
  showLogout = false,
  logoutRedirectTo,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const homeHref = area === "admin" ? "/admin" : "/biz";
  const areaLabel = area === "admin" ? "Admin" : "Biznes";
  const logoutTo =
    logoutRedirectTo ?? (area === "admin" ? "/admin/login" : "/biz/login");

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className={`dash${menuOpen ? " dash--menu-open" : ""}`}>
      <header className="dash__topbar">
        <Link
          href={homeHref}
          className="dash__brand"
          aria-label={`${areaLabel} — paneli`}
        >
          <LogoMark size={28} />
          <div className="dash__brand-text">
            <Wordmark className="dash__wordmark" />
            <span className="dash__area">{areaLabel}</span>
          </div>
        </Link>

        <button
          type="button"
          className="dash__menu-btn"
          aria-expanded={menuOpen}
          aria-controls="dash-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="visually-hidden">
            {menuOpen ? "Mbyll menynë" : "Hap menynë"}
          </span>
          <span className="dash__menu-icon" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="dash__backdrop"
          aria-label="Mbyll menynë"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside id="dash-nav" className="dash__aside">
        <Link
          href={homeHref}
          className="dash__brand dash__brand--aside"
          aria-label={`${areaLabel} — paneli`}
        >
          <LogoMark size={32} />
          <div className="dash__brand-text">
            <Wordmark className="dash__wordmark" />
            <span className="dash__area">{areaLabel}</span>
          </div>
        </Link>

        <nav className="dash__nav" aria-label={areaLabel}>
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== homeHref && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "is-active" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="dash__aside-foot">
          {showLogout ? <LogoutButton redirectTo={logoutTo} /> : null}
          <Link href="/" className="dash__public" onClick={() => setMenuOpen(false)}>
            ← Faqja publike
          </Link>
        </div>
      </aside>

      <div className="dash__main">
        <div className="dash__body">{children}</div>
      </div>
    </div>
  );
}
