export type Theme = "light" | "dark";

/** Admin and business dashboards stay dark. Public shop URLs start with /biznese. */
export function isDashboardPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/biz" ||
    pathname.startsWith("/biz/")
  );
}

export const THEME_STORAGE_KEY = "zbritjasot-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#0B0F0E" : "#F5F5F5");
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore private-mode / blocked storage.
  }
  themeListeners.forEach((listener) => listener());
}

const themeListeners = new Set<() => void>();

export function subscribeTheme(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

/** Saved theme in the browser. The server always starts from light. */
export function readThemePreference(): Theme {
  return getStoredTheme() ?? "light";
}

export function serverThemePreference(): Theme {
  return "light";
}
