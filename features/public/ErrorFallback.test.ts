/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorFallback } from "@/features/public/ErrorFallback";
import PublicError from "@/app/(public)/error";
import AppError from "@/app/error";

afterEach(() => {
  cleanup();
});

function homeLink() {
  return screen.getByRole("link", { name: "Faqja kryesore" });
}

describe("ErrorFallback", () => {
  it("retries with reset and sends the home link somewhere visible on hover", () => {
    const reset = vi.fn();
    render(createElement(ErrorFallback, { reset, variant: "content" }));

    fireEvent.click(screen.getByRole("button", { name: "Provo përsëri" }));
    expect(reset).toHaveBeenCalledOnce();

    const home = homeLink();
    expect(home.getAttribute("href")).toBe("/");
    expect(home.className).toContain("hover:bg-hover");
    expect(home.className).not.toContain("hover:text-accent");
    expect(screen.queryByRole("banner")).toBeNull();
  });

  it("keeps the root fallback as its own page, without site chrome", () => {
    render(createElement(ErrorFallback, { reset: vi.fn(), variant: "bare" }));

    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Diçka shkoi keq" })).toBeTruthy();
    expect(screen.queryByRole("banner")).toBeNull();
    expect(homeLink().className).toContain("hover:bg-hover");
  });
});

describe("route error boundaries", () => {
  it("renders the public boundary as in-layout content", () => {
    const reset = vi.fn();
    render(createElement(PublicError, { error: new Error("publike"), reset }));

    fireEvent.click(screen.getByRole("button", { name: "Provo përsëri" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByRole("main")).toBeNull();
    expect(homeLink().getAttribute("href")).toBe("/");
  });

  it("keeps the root boundary for routes outside the public layout", () => {
    render(createElement(AppError, { error: new Error("admin"), reset: vi.fn() }));

    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Provo përsëri" })).toBeTruthy();
    expect(homeLink().getAttribute("href")).toBe("/");
  });
});
