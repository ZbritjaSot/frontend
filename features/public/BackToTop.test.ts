/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackToTop } from "@/features/public/BackToTop";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("BackToTop", () => {
  it("appears only after scrolling past one screen and scrolls smoothly to the top", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
    const scroll = vi.fn();
    window.scrollTo = scroll as never;

    scrollTo(0);
    render(createElement(BackToTop));
    expect(screen.queryByRole("button", { name: "Kthehu në krye" })).toBeNull();

    scrollTo(900);
    fireEvent.click(screen.getByRole("button", { name: "Kthehu në krye" }));
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("jumps instantly when the user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    const scroll = vi.fn();
    window.scrollTo = scroll as never;

    scrollTo(900);
    render(createElement(BackToTop));
    fireEvent.click(screen.getByRole("button", { name: "Kthehu në krye" }));
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
