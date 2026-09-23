"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { LogoutButton } from "@/features/auth/LogoutButton";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Shown when > 0 (e.g. pending offer count). */
  badge?: number;
  /** Pending is the yellow offer pill. Danger is the red pill. */
  badgeTone?: "pending" | "danger";
  /** Screen-reader text. Defaults from the tone. */
  badgeLabel?: string;
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
    <div className="grid min-h-dvh grid-cols-1 grid-rows-[auto_1fr] min-[860px]:grid-cols-[15.5rem_1fr] min-[860px]:grid-rows-1">
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-5 border-b border-line bg-elevated px-5 py-2.5 min-[860px]:hidden">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-3"
          aria-label={`${areaLabel} — paneli`}
        >
          <LogoMark size={28} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Wordmark className="text-[1.05rem]" />
            <span className="text-[0.6875rem] font-bold tracking-[0.16em] text-accent uppercase">
              {areaLabel}
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="inline-flex size-11 cursor-pointer appearance-none items-center justify-center rounded-lg border border-line bg-transparent text-ink hover:border-accent/45"
          aria-expanded={menuOpen}
          aria-controls="dash-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">
            {menuOpen ? "Mbyll menynë" : "Hap menynë"}
          </span>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[35] cursor-pointer border-0 bg-charcoal/55 p-0 min-[860px]:hidden"
          aria-label="Mbyll menynë"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        id="dash-nav"
        className={`fixed top-0 bottom-0 left-0 z-[40] flex w-[min(18rem,86vw)] flex-col gap-8 border-r border-line bg-elevated p-8 transition-transform min-[860px]:sticky min-[860px]:w-auto min-[860px]:min-h-dvh min-[860px]:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-[105%]"
        }`}
      >
        <Link
          href={homeHref}
          className="hidden min-w-0 items-center gap-3 min-[860px]:flex"
          aria-label={`${areaLabel} — paneli`}
        >
          <LogoMark size={32} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Wordmark className="text-[1.05rem]" />
            <span className="text-[0.6875rem] font-bold tracking-[0.16em] text-accent uppercase">
              {areaLabel}
            </span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1.5" aria-label={areaLabel}>
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== homeHref && pathname.startsWith(`${item.href}/`));

            const badge =
              typeof item.badge === "number" && item.badge > 0
                ? item.badge
                : null;
            const badgeLabel =
              item.badgeLabel ??
              (item.badgeTone === "danger"
                ? `${badge} të skaduara`
                : `${badge} në pritje`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-3 text-[0.9375rem] font-semibold text-ink/80 hover:bg-slate/12 hover:text-ink ${
                  active ? "bg-accent/28 text-ink" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {item.icon}
                  <span className="min-w-0">{item.label}</span>
                </span>
                {badge !== null ? (
                  <span
                    className={`inline-flex h-[1.35rem] min-w-[1.35rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[0.6875rem] leading-none font-extrabold ${
                      item.badgeTone === "danger"
                        ? "bg-danger-soft text-charcoal"
                        : item.badgeTone === "pending"
                          ? "bg-pending text-charcoal"
                          : "bg-accent text-on-accent"
                    }`}
                    aria-label={badgeLabel}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-start gap-3">
          {showLogout ? <LogoutButton redirectTo={logoutTo} /> : null}
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
            onClick={() => setMenuOpen(false)}
          >
            <ArrowBackIcon fontSize="small" />
            Faqja publike
          </Link>
        </div>
      </aside>

      <div className="col-start-1 row-start-2 flex min-w-0 flex-col min-[860px]:col-start-2 min-[860px]:row-start-1">
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
