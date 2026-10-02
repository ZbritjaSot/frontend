"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import type { ReactNode } from "react";

const rowClass =
  "flex min-h-14 w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left text-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent";

export function SettingsPanel() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Band pad="page">
      <p className={kicker}>Aplikacioni</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Cilësimet</h1>

      <div className="mt-8 max-w-xl overflow-hidden rounded-2xl border border-line bg-elevated dark:border-white/10">
        <button type="button" className={rowClass} onClick={toggleTheme}>
          <span className="inline-flex size-7 items-center justify-center text-ink" aria-hidden>
            {isDark ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold">Pamja</span>
            <span className="block text-sm font-semibold text-muted">
              {isDark ? "E errët" : "E ndritshme"}
            </span>
          </span>
        </button>
        <RowRule />
        <SettingsLink
          href="/cilesimet/njoftimet"
          label="Njoftimet"
          detail="Së shpejti"
          icon={<NotificationsNoneIcon fontSize="small" />}
        />
        <RowRule />
        <SettingsLink
          href="/cilesimet/partner"
          label="Bëhu Partner"
          icon={<StorefrontOutlinedIcon fontSize="small" />}
        />
        <RowRule />
        <SettingsLink
          href="/cilesimet/kontakt"
          label="Na Kontakto"
          icon={<MailOutlinedIcon fontSize="small" />}
        />
      </div>

      <div className="my-6 max-w-xl border-t border-line dark:border-white/10" />

      <div className="max-w-xl overflow-hidden rounded-2xl border border-line bg-elevated dark:border-white/10">
        <SettingsLink
          href="/biz/login"
          label="Hyr"
          detail="Paneli i biznesit"
          icon={<LoginOutlinedIcon fontSize="small" />}
        />
      </div>
    </Band>
  );
}

function SettingsLink({
  href,
  label,
  detail,
  icon,
}: {
  href: string;
  label: string;
  detail?: string;
  icon: ReactNode;
}) {
  const pathname = usePathname();
  const current = pathname === href;

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={rowClass}
    >
      <span className="inline-flex size-7 items-center justify-center text-ink" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold">{label}</span>
        {detail ? (
          <span className="block text-sm font-semibold text-muted">{detail}</span>
        ) : null}
      </span>
      <ChevronRightIcon fontSize="small" className="text-muted" aria-hidden />
    </Link>
  );
}

function RowRule() {
  return <div className="ml-[3.25rem] h-px bg-line dark:bg-white/10" />;
}
