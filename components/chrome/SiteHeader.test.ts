/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { writeFavoriteKeys } from "@/lib/favorites";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    className,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    onClick?: () => void;
    className?: string;
  }) => createElement("a", { href, onClick, className, ...rest }, children),
}));

const { SiteHeader } = await import("@/components/chrome/SiteHeader");

function seed(n: number) {
  act(() => {
    writeFavoriteKeys(Array.from({ length: n }, (_, i) => `offer:${i}` as const));
  });
}

afterEach(() => {
  cleanup();
  act(() => writeFavoriteKeys([]));
  window.localStorage.clear();
});

describe("SiteHeader favourites badge", () => {
  it("is hidden at 0 and keeps the plain label", () => {
    render(createElement(SiteHeader));
    expect(screen.queryByTestId("favorites-badge")).toBeNull();
    expect(screen.getByRole("link", { name: "Të preferuarat" })).toBeTruthy();
  });

  it("shows the count, updates live, and includes it in the accessible name", () => {
    render(createElement(SiteHeader));
    seed(3);
    const badge = screen.getByTestId("favorites-badge");
    expect(badge.textContent).toBe("3");
    expect(badge.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("link", { name: "Të preferuarat, 3" })).toBeTruthy();
    seed(0);
    expect(screen.queryByTestId("favorites-badge")).toBeNull();
  });

  it("caps the display at 99+ but keeps the real count in the label", () => {
    render(createElement(SiteHeader));
    seed(100);
    expect(screen.getByTestId("favorites-badge").textContent).toBe("99+");
    expect(screen.getByRole("link", { name: "Të preferuarat, 100" })).toBeTruthy();
    seed(99);
    expect(screen.getByTestId("favorites-badge").textContent).toBe("99");
  });
});
