"use client";

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
      className={["theme-toggle", className].filter(Boolean).join(" ")}
      onClick={toggleTheme}
      aria-label={isDark ? "Kalo në temën e ndritshme" : "Kalo në temën e errët"}
      title={isDark ? "Tema e ndritshme" : "Tema e errët"}
    >
      <SunIcon />
      <MoonIcon />
    </button>
  );
}

function MoonIcon() {
  return (
    <svg
      className="theme-toggle__icon theme-toggle__icon--moon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M21 14.3A9 9 0 0 1 9.7 3a7.2 7.2 0 1 0 11.3 11.3Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="theme-toggle__icon theme-toggle__icon--sun"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16.5a1 1 0 0 1 1 1V4a1 1 0 1 1-2 0V2.5a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 0 1-1.42 1.42L4.22 5.64a1 1 0 0 1 0-1.42Zm12.08 12.08a1 1 0 0 1 1.42 0l1.06 1.06a1 1 0 1 1-1.42 1.42l-1.06-1.06a1 1 0 0 1 0-1.42ZM1.5 12a1 1 0 0 1 1-1H4a1 1 0 1 1 0 2H2.5a1 1 0 0 1-1-1Zm17 0a1 1 0 0 1 1-1H21a1 1 0 1 1 0 2h-1.5a1 1 0 0 1-1-1ZM4.22 19.78a1 1 0 0 1 0-1.42l1.06-1.06a1 1 0 1 1 1.42 1.42l-1.06 1.06a1 1 0 0 1-1.42 0Zm12.08-12.08a1 1 0 0 1 0-1.42l1.06-1.06a1 1 0 1 1 1.42 1.42l-1.06 1.06a1 1 0 0 1-1.42 0Z"
      />
    </svg>
  );
}
