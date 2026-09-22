import Link from "next/link";
import type { ReactNode } from "react";
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
  const homeHref = area === "admin" ? "/admin" : "/biz";
  const areaLabel = area === "admin" ? "Admin" : "Biznes";
  const logoutTo =
    logoutRedirectTo ?? (area === "admin" ? "/admin/login" : "/biz/login");

  return (
    <div className="dash">
      <aside className="dash__aside">
        <Link
          href={homeHref}
          className="dash__brand"
          aria-label={`${areaLabel} — paneli`}
        >
          <LogoMark size={32} />
          <div className="dash__brand-text">
            <Wordmark className="dash__wordmark" />
            <span className="dash__area">{areaLabel}</span>
          </div>
        </Link>

        <nav className="dash__nav" aria-label={areaLabel}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="dash__aside-foot">
          {showLogout ? <LogoutButton redirectTo={logoutTo} /> : null}
          <Link href="/" className="dash__public">
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
