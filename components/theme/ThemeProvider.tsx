"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { applyTheme, getStoredTheme, storeTheme, type Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/biz");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [preference, setPreference] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    return getStoredTheme() ?? "light";
  });

  const theme: Theme = isDashboardPath(pathname) ? "dark" : preference;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setPreference(next);
    storeTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      storeTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
