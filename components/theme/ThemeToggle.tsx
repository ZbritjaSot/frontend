"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@/components/theme/ThemeProvider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={[
        "inline-flex size-10 cursor-pointer appearance-none items-center justify-center rounded-xl border border-line bg-elevated p-0 text-ink motion-safe:transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={toggleTheme}
      aria-label={isDark ? "Kalo në temën e ndritshme" : "Kalo në temën e errët"}
      title={isDark ? "Tema e ndritshme" : "Tema e errët"}
    >
      <DarkModeIcon fontSize="small" className="hidden! light:inline-block!" />
      <LightModeIcon fontSize="small" className="hidden! dark:inline-block!" />
    </button>
  );
}
