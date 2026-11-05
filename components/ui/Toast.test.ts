/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/ui/Toast";

type ShowToast = ReturnType<typeof useToast>["showToast"];

/** Grabs `showToast` out of context so tests can call it directly. */
function Harness({ onReady }: { onReady: (showToast: ShowToast) => void }) {
  const { showToast } = useToast();
  useEffect(() => {
    onReady(showToast);
  }, [onReady, showToast]);
  return null;
}

function renderProvider() {
  let showToast: ShowToast = () => {};
  render(
    createElement(
      ToastProvider,
      null,
      createElement(Harness, { onReady: (fn) => (showToast = fn) }),
    ),
  );
  return (...args: Parameters<ShowToast>) => act(() => showToast(...args));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("renders a single aria-live region and announces the toast message", () => {
    const showToast = renderProvider();
    showToast("U dërgua për aprovim");

    const regions = document.querySelectorAll('[aria-live="polite"]');
    expect(regions).toHaveLength(1);
    expect(screen.getByText("U dërgua për aprovim")).toBeTruthy();
  });

  it("auto-dismisses after the default duration", () => {
    const showToast = renderProvider();
    showToast("U ruajt");
    expect(screen.getByText("U ruajt")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.getByText("U ruajt")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("U ruajt")).toBeNull();
  });

  it("gives error toasts a longer duration so the failure reason stays readable", () => {
    const showToast = renderProvider();
    showToast("Nuk mundëm ta ruajmë ofertën.", { tone: "error" });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("Nuk mundëm ta ruajmë ofertën.")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Nuk mundëm ta ruajmë ofertën.")).toBeNull();
  });

  it("dismisses immediately when the close button is clicked", () => {
    const showToast = renderProvider();
    showToast("U fshi oferta");

    fireEvent.click(screen.getByRole("button", { name: /^Mbyll njoftimin/ }));
    expect(screen.queryByText("U fshi oferta")).toBeNull();
  });

  it("dismisses on Escape while focus is inside the toast", () => {
    const showToast = renderProvider();
    showToast("U ruajt");

    const toast = screen.getByText("U ruajt").parentElement as HTMLElement;
    fireEvent.keyDown(toast, { key: "Escape" });
    expect(screen.queryByText("U ruajt")).toBeNull();
  });

  it("runs the action callback and dismisses when its button is clicked", () => {
    const onUndo = vi.fn();
    const showToast = renderProvider();
    showToast("U hoq nga të preferuarat", {
      action: { label: "Zhbëj", onClick: onUndo },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Zhbëj/ }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("U hoq nga të preferuarat")).toBeNull();
  });

  it("stacks rapid toasts instead of replacing the previous one", () => {
    const showToast = renderProvider();
    showToast("U aprovua · Shiko në faqe #1");
    showToast("U aprovua · Shiko në faqe #2");
    showToast("U aprovua · Shiko në faqe #3");

    expect(screen.getByText("U aprovua · Shiko në faqe #1")).toBeTruthy();
    expect(screen.getByText("U aprovua · Shiko në faqe #2")).toBeTruthy();
    expect(screen.getByText("U aprovua · Shiko në faqe #3")).toBeTruthy();
  });

  it("caps simultaneous toasts by dropping the oldest once the cap is exceeded", () => {
    const showToast = renderProvider();
    for (let i = 1; i <= 5; i += 1) {
      showToast(`Njoftim ${i}`);
    }

    expect(screen.queryByText("Njoftim 1")).toBeNull();
    expect(screen.getByText("Njoftim 2")).toBeTruthy();
    expect(screen.getByText("Njoftim 5")).toBeTruthy();
  });

  it("renders a thumbnail image when a URL is provided", () => {
    const showToast = renderProvider();
    showToast("U shtua te të preferuarat", {
      thumbnail: { url: "https://cdn.example.com/a.jpg", name: "Byrek me spinaq" },
    });

    const image = document.querySelector("img");
    expect(image).toBeTruthy();
    expect(image?.getAttribute("alt")).toBe("");
    expect(image?.getAttribute("src")).toContain("cdn.example.com");
  });

  it("renders the name-hashed fallback when the thumbnail has no url", () => {
    const showToast = renderProvider();
    showToast("U shtua te të preferuarat", {
      thumbnail: { name: "Byrek me spinaq" },
    });

    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("BM")).toBeTruthy();
  });

  it("falls back to initials once the thumbnail image fails to load", () => {
    const showToast = renderProvider();
    showToast("U shtua te të preferuarat", {
      thumbnail: { url: "https://cdn.example.com/broken.jpg", name: "Byrek me spinaq" },
    });

    const image = document.querySelector("img") as HTMLImageElement;
    expect(image).toBeTruthy();

    fireEvent.error(image);

    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("BM")).toBeTruthy();
  });

  it("replaces a same-key toast in place instead of stacking a second one", () => {
    const showToast = renderProvider();
    showToast("U shtua te të preferuarat", { key: "favorite" });
    showToast("U hoq nga të preferuarat", { key: "favorite" });

    expect(screen.queryByText("U shtua te të preferuarat")).toBeNull();
    expect(screen.getByText("U hoq nga të preferuarat")).toBeTruthy();

    const regions = document.querySelectorAll('[aria-live="polite"] > *');
    expect(regions).toHaveLength(1);
  });

  it("appends a new toast when a key doesn't match anything currently visible", () => {
    const showToast = renderProvider();
    showToast("Njoftim A", { key: "favorite" });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Njoftim A")).toBeNull();

    showToast("Njoftim B", { key: "favorite" });
    expect(screen.getByText("Njoftim B")).toBeTruthy();
  });

  it("gives a same-key replacement its own full duration instead of inheriting the old toast's remaining time", () => {
    const showToast = renderProvider();
    showToast("Njoftim A", { key: "favorite" });

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText("Njoftim A")).toBeTruthy();

    showToast("Njoftim B", { key: "favorite" });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // B's 5s default duration started fresh on replacement, so at +2s it's
    // still showing — if the old timer had carried over (A's remaining 1s),
    // B would already be gone.
    expect(screen.getByText("Njoftim B")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("Njoftim B")).toBeNull();
  });

  it("treats a replaced toast as the newest, not the oldest slot it happened to occupy", () => {
    const showToast = renderProvider();
    // Fill the stack to the cap (4) with the keyed toast in the OLDEST slot.
    showToast("Njoftim A", { key: "favorite" });
    showToast("Njoftim C1");
    showToast("Njoftim C2");
    showToast("Njoftim C3");
    expect(document.querySelectorAll('[aria-live="polite"] > *')).toHaveLength(4);

    // Refresh the keyed toast in place.
    showToast("Njoftim B", { key: "favorite" });
    expect(document.querySelectorAll('[aria-live="polite"] > *')).toHaveLength(4);
    expect(screen.getByText("Njoftim B")).toBeTruthy();

    // One more toast arrives, pushing the stack over the cap. If the
    // refreshed toast were still treated as the oldest (updated in its old
    // slot instead of moved to the end), it would be the one evicted here —
    // even though it's the most recently shown toast on screen.
    showToast("Njoftim C4");
    expect(document.querySelectorAll('[aria-live="polite"] > *')).toHaveLength(4);
    expect(screen.getByText("Njoftim B")).toBeTruthy();
    expect(screen.queryByText("Njoftim C1")).toBeNull();
  });
});
