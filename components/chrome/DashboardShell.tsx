"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
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

type DashboardShellProps = PropsWithChildren<{
  area: "admin" | "biz";
  /** Small label under the wordmark. Managers use Menaxher. */
  label?: string;
  nav: DashboardNavItem[];
  showLogout?: boolean;
  logoutRedirectTo?: string;
}>;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isHidden(element: HTMLElement) {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.hidden) {
      return true;
    }
    const style = window.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function focusableItems(drawer: HTMLElement, trigger: HTMLElement | null) {
  const drawerItems = Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !isHidden(element),
  );
  if (trigger && !isHidden(trigger)) {
    return [trigger, ...drawerItems];
  }
  return drawerItems;
}

export function DashboardShell({
  area,
  label,
  nav,
  children,
  showLogout = false,
  logoutRedirectTo,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef(false);
  const homeHref = area === "admin" ? "/admin" : "/biz";
  const areaLabel = label ?? (area === "admin" ? "Admin" : "Biznes");
  const logoutTo = logoutRedirectTo ?? "/login";
  const drawerClosed = !isDesktop && !menuOpen;

  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setIsDesktop(media.matches);
      if (media.matches) {
        setMenuOpen(false);
      }
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isDesktop || !menuOpen) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        const trigger = menuButtonRef.current;
        if (trigger && !isHidden(trigger)) {
          trigger.focus();
        }
      }
      return;
    }

    restoreFocus.current = true;
    const drawer = drawerRef.current;
    if (!drawer) {
      return;
    }

    const items = () => focusableItems(drawer, menuButtonRef.current);
    const drawerItems = items().filter((item) => item !== menuButtonRef.current);
    (drawerItems[0] ?? items()[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const current = items();
      if (current.length === 0) {
        return;
      }
      const index = current.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const nextIndex =
        index === -1
          ? event.shiftKey
            ? current.length - 1
            : 0
          : (index + (event.shiftKey ? -1 : 1) + current.length) % current.length;
      current[nextIndex]?.focus();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isDesktop, menuOpen]);

  return (
    <div className="grid h-dvh grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:grid-rows-1">
      <a
        href="#dash-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-charcoal"
      >
        Kalo te përmbajtja
      </a>
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-5 border-b border-line bg-elevated px-5 py-2.5 lg:hidden">
        <Link
          href={homeHref}
          className={`flex min-w-0 items-center gap-3 rounded-lg ${focusRing}`}
          aria-label={`${areaLabel} — paneli`}
        >
          <LogoMark size={28} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Wordmark className="text-[1.05rem]" />
            <span className="text-kicker text-accent-fg uppercase">
              {areaLabel}
            </span>
          </div>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex size-11 cursor-pointer appearance-none items-center justify-center rounded-lg border border-line bg-transparent text-ink hover:border-accent/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
          className="fixed inset-0 z-[35] cursor-pointer border-0 bg-charcoal/55 p-0 lg:hidden"
          aria-label="Mbyll menynë"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        ref={drawerRef}
        id="dash-nav"
        inert={drawerClosed ? true : undefined}
        aria-hidden={drawerClosed ? true : undefined}
        className={`fixed top-0 bottom-0 left-0 z-[40] flex h-dvh w-[min(18rem,86vw)] flex-col gap-8 overflow-hidden border-r border-line bg-elevated p-8 transition-transform lg:static lg:z-auto lg:h-auto lg:w-auto lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-[105%]"
        }`}
      >
        <Link
          href={homeHref}
          className={`hidden min-w-0 shrink-0 items-center gap-3 rounded-lg lg:flex ${focusRing}`}
          aria-label={`${areaLabel} — paneli`}
          tabIndex={drawerClosed ? -1 : undefined}
        >
          <LogoMark size={32} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Wordmark className="text-[1.05rem]" />
            <span className="text-kicker text-accent-fg uppercase">
              {areaLabel}
            </span>
          </div>
        </Link>

        <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto" aria-label={areaLabel}>
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
                aria-current={active ? "page" : undefined}
                tabIndex={drawerClosed ? -1 : undefined}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-3 text-[0.9375rem] font-semibold text-ink/80 hover:bg-slate/12 hover:text-ink ${focusRing} ${
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

        <div className="flex shrink-0 flex-col items-start gap-3">
          {showLogout ? <LogoutButton redirectTo={logoutTo} /> : null}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={drawerClosed ? -1 : undefined}
            className={`inline-flex min-h-10 items-center gap-1 rounded-lg text-sm font-semibold text-muted hover:text-accent-fg ${focusRing}`}
            onClick={() => setMenuOpen(false)}
          >
            <ArrowBackIcon fontSize="small" />
            Faqja publike
          </Link>
        </div>
      </aside>

      <main
        id="dash-main"
        tabIndex={-1}
        className="col-start-1 row-start-2 min-h-0 min-w-0 overflow-y-auto lg:col-start-2 lg:row-start-1"
      >
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
