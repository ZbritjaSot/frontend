/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/cilesimet",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => createElement("a", { href, className, ...rest }, children),
}));

const { SettingsPanel } = await import("@/features/public/SettingsPanel");

afterEach(() => {
  cleanup();
});

describe("SettingsPanel", () => {
  it("opens on Cilësimet without the Aplikacioni kicker", () => {
    render(createElement(ThemeProvider, null, createElement(SettingsPanel)));

    const heading = screen.getByRole("heading", { level: 1, name: "Cilësimet" });
    expect(heading.className).toBe("m-0 text-title-1");
    expect(screen.queryByText("Aplikacioni")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Preferencat" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Na shkruaj" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Biznesi" })).toBeTruthy();
  });
});
