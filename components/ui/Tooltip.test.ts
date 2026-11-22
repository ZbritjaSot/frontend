/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type FC } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "@/components/ui/Tooltip";

const realMatches = Element.prototype.matches;

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no :focus-visible; treat programmatic focus as keyboard focus.
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, selector) {
    return selector === ":focus-visible" ? this === document.activeElement : realMatches.call(this, selector);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function renderTip(props: { content?: string; label?: string; disabled?: boolean } = {}) {
  const { content = "Fshi ofertën", label = "Fshi Oferta 1", disabled = false } = props;
  return render(
    createElement(
      Tooltip as FC<{ content: string }>,
      { content },
      createElement("button", { type: "button", "aria-label": label, disabled }, "x"),
    ),
  );
}

describe("Tooltip", () => {
  it("shows on hover after a short delay and hides on leave", () => {
    renderTip();
    const button = screen.getByRole("button");
    fireEvent.pointerEnter(button, { pointerType: "mouse" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(screen.getByRole("tooltip").textContent).toBe("Fshi ofertën");
    fireEvent.pointerLeave(button, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("stays open while the bubble is hovered", () => {
    renderTip();
    const button = screen.getByRole("button");
    fireEvent.pointerEnter(button, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(160);
    });
    fireEvent.pointerLeave(button, { pointerType: "mouse" });
    fireEvent.pointerEnter(screen.getByRole("tooltip"), { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("does not show for touch pointers", () => {
    renderTip();
    fireEvent.pointerEnter(screen.getByRole("button"), { pointerType: "touch" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows immediately on keyboard focus, hides on Escape and blur", () => {
    renderTip();
    const button = screen.getByRole("button");
    act(() => button.focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => button.blur());
    act(() => button.focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
    act(() => button.blur());
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("links the trigger to the tooltip with aria-describedby and keeps aria-label", () => {
    renderTip();
    const button = screen.getByRole("button");
    act(() => button.focus());
    const tip = screen.getByRole("tooltip");
    expect(button.getAttribute("aria-describedby")).toBe(tip.id);
    expect(button.getAttribute("aria-label")).toBe("Fshi Oferta 1");
  });

  it("skips aria-describedby when the text equals the aria-label", () => {
    renderTip({ content: "Fshi", label: "Fshi" });
    const button = screen.getByRole("button");
    act(() => button.focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  it("works on a disabled button via the wrapper", () => {
    renderTip({ disabled: true });
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.pointerEnter(button.parentElement as HTMLElement, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("renders children untouched when content is empty", () => {
    const { container } = renderTip({ content: "" });
    expect(container.firstElementChild?.tagName).toBe("BUTTON");
    fireEvent.pointerEnter(screen.getByRole("button"), { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
