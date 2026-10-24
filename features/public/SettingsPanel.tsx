"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import type { ReactNode } from "react";

const group =
  "overflow-hidden rounded-2xl border border-line bg-elevated dark:border-white/10";

const sectionLabel =
  "m-0 mb-2.5 text-[0.68rem] font-bold tracking-[0.18em] text-muted uppercase";

export function SettingsPanel() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Band pad="page">
      <div className="max-w-xl">
        <p className={kicker}>Aplikacioni</p>
        <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,3.6rem)] ${display}`}>
          Cilësimet
        </h1>
        <p className="mt-3 mb-0 text-base leading-relaxed text-muted">
          Pamja dhe mënyrat për të na kontaktuar.
        </p>

        <section className="mt-10">
          <h2 className={sectionLabel}>Preferencat</h2>
          <div className={group}>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-[4.25rem] w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-4 py-3.5 text-left text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
            >
              <IconWell>
                {isDark ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconWell>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-extrabold tracking-tight">Pamja</span>
                <span className="mt-0.5 block text-sm font-semibold text-muted">
                  Ndrysho midis pamjes së ndritshme dhe të errët
                </span>
              </span>
              <span className="shrink-0 rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-bold tracking-tight text-ink dark:border-white/10 dark:bg-sunken">
                {isDark ? "E errët" : "E ndritshme"}
              </span>
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className={sectionLabel}>Na shkruaj</h2>
          <div className={group}>
            <SettingsLink
              href="/cilesimet/partner"
              label="Bëhu Partner"
              detail="Apliko që dyqani yt të shfaqet në ZbritjaSot"
              icon={<StorefrontOutlinedIcon fontSize="small" />}
              emphasis
            />
            <RowRule />
            <SettingsLink
              href="/cilesimet/kontakt"
              label="Na Kontakto"
              detail="Pyetje, sugjerime ose probleme me faqen"
              icon={<MailOutlinedIcon fontSize="small" />}
              emphasis
            />
          </div>
        </section>

        <section className="mt-8">
          <h2 className={sectionLabel}>Biznesi</h2>
          <div className={group}>
            <SettingsLink
              href="/login"
              label="Hyr"
              detail="Paneli i biznesit"
              icon={<LoginOutlinedIcon fontSize="small" />}
            />
          </div>
        </section>
      </div>
    </Band>
  );
}

function SettingsLink({
  href,
  label,
  detail,
  icon,
  muted = false,
  emphasis = false,
}: {
  href: string;
  label: string;
  detail?: string;
  icon: ReactNode;
  muted?: boolean;
  emphasis?: boolean;
}) {
  const pathname = usePathname();
  const current = pathname === href;

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={[
        "flex w-full items-center gap-3.5 px-4 py-3.5 text-left no-underline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
        emphasis ? "min-h-[4.5rem]" : "min-h-[4.25rem]",
        muted ? "text-muted" : "text-ink",
      ].join(" ")}
    >
      <IconWell muted={muted}>{icon}</IconWell>
      <span className="min-w-0 flex-1">
        <span
          className={[
            "block tracking-tight",
            emphasis ? "text-base font-extrabold" : "text-base font-bold",
            muted ? "text-muted" : "text-ink",
          ].join(" ")}
        >
          {label}
        </span>
        {detail ? (
          <span
            className={[
              "mt-0.5 block text-sm leading-snug font-semibold",
              muted ? "text-muted/80" : "text-muted",
            ].join(" ")}
          >
            {detail}
          </span>
        ) : null}
      </span>
      <ChevronRightIcon
        fontSize="small"
        className={muted ? "text-muted/60" : "text-muted"}
        aria-hidden
      />
    </Link>
  );
}

function IconWell({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <span
      className={[
        "inline-grid size-10 shrink-0 place-items-center rounded-xl",
        muted
          ? "bg-sunken text-muted dark:bg-white/5"
          : "bg-sunken text-ink dark:bg-white/8",
      ].join(" ")}
      aria-hidden
    >
      {children}
    </span>
  );
}

function RowRule() {
  return <div className="ml-[4.25rem] h-px bg-line dark:bg-white/10" />;
}
